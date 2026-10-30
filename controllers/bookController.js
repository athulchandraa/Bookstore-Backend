const books=require('../models/booksModel')
const stripe=require('stripe')(process.env.STRIPE_SK)
const {GoogleGenerativeAI, GenerativeModel}=require('@google/generative-ai')

//add Books

exports.addBookController=async(req,res)=>{
    console.log("Inside add Book Controller");
    const{title,author,imageURL,pages,price,discountPrice,abstract,publisher,isbn,language,category}=req.body
    const uploadImages=req.files.map(item=>item.filename)
    const sellerMail=req.payload
    console.log(title,author,imageURL,pages,price,discountPrice,abstract,publisher,isbn,language,category,uploadImages,sellerMail);
    //Check existing BOoks
    const existingBook=await books.findOne({title,sellerMail})
    if(existingBook){
        res.status(409).json("Book Already Exist...")
    }else{
        const newBook=await books.create({title,author,imageURL,pages,price,discountPrice,abstract,publisher,isbn,language,category,uploadImages,sellerMail})
        res.status(201).json({newBook})
    }
}
//Get Latest Books

exports.getHomeBooks=async(req,res)=>{
    console.log("Inside getHomeBooks");
    const homeBooks=await books.find().sort({_id:-1}).limit(4)
    res.status(200).json(homeBooks)
}

//Get All Books : Ignore own books

exports.getAllBooksController=async(req,res)=>{
    console.log("Inside getAllBooksController");
    const LoginedUserMail=req.payload
    const searchKey=req.query.search
    const allBooks=await books.find({sellerMail:{$ne:LoginedUserMail},title:{$regex:searchKey,$options:"i"}})
    res.status(200).json(allBooks)
}

//Get Logined User uploaded Books

exports.getUserBookController=async(req,res)=>{
    console.log("Inside getUserBookController");
    const loginedMail=req.payload
    const userBooks=await books.find({sellerMail:loginedMail})
    res.status(200).json(userBooks)
}

//Get Loginned USer Purchased Books
exports.getUserPurchaseBookController=async(req,res)=>{
    console.log("Inside getUserPurchaseBookController");
    const loginedMail=req.payload
    const userPurchasedBooks=await books.find({buyerMail:loginedMail})
    res.status(200).json(userPurchasedBooks)
}
//Get a single Book to view

exports.viewBookController=async(req,res)=>{
    console.log("Inside viewBookController");
    const {id}=req.params
    const bookDetails=await books.find({_id:id})
    res.status(200).json(bookDetails)
}

//Delete Book uploaded by logined user

exports.DeleteUploadedBooks=async(req,res)=>{
    console.log("Inside DeleteUploadedBooks");
    const{id}=req.params
    const deleteBooks=await books.findByIdAndDelete({_id:id})
    res.status(200).json(deleteBooks)
}

//get All Books : admin Page
//Update Book status : Admin Page
//Book Payment
exports.bookPaymentControl=async(req,res)=>{
    console.log("Inside bookPaymentControl");
    const buyerMail=req.payload
    const{id}=req.params
    const bookDetails=await books.findById({_id:id})
    bookDetails.status="sold"
    //Incase Error vannal Ivde nokkiya mathi Spelling Mismatch undonn
    bookDetails.buyerMail=buyerMail
    await bookDetails.save()

    //CREATE STRIPE CHECKOUT SESSIONS
    const line_items=[{
        price_data:{
            currency : "usd",
            unit_amount:Math.round(bookDetails.discountPrice*100),
            product_data: {
                name : bookDetails.title,
                description : `${bookDetails.author} , ${bookDetails.publisher}`,
                // images : bookDetails.uploadImages,
                metadata:{
                    title:bookDetails.title,author:bookDetails.author,price:bookDetails.discountPrice
                }
            }
        },
        quantity:1

    }]
    console.log(line_items);
    

    const session = await stripe.checkout.sessions.create({
        success_url:"http://localhost:5173/success",
        cancel_url:"http://localhost:5173/failed",
        line_items,
        mode:'payment',
        allowed_payment_method_types:['card','upi'],
    })
    console.log(session);
    res.status(200).json({checkoutURL:session.url})
}



//Get all Books
exports.getAllBooks=async(req,res)=>{
    console.log("Inside getAllBooks");
    const allBooks=await books.find()
    res.status(200).json(allBooks)
}

//Update Book Status
exports.updateBookStatus=async(req,res)=>{
    console.log("Inside updateBookStatus");
    const {id}=req.params
    const bookDetails=await books.findById({_id:id})
    bookDetails.status="approved"
    await bookDetails.save()
    res.status(200).json(bookDetails)
}

//Get book Abstract from GEMINI API
exports.generateAbstrcatController=async(req,res)=>{
    console.log("Inside generateAbstrcatController");
    const genAI=new GoogleGenerativeAI(process.env.GEMINI_API)
    const{title}=req.body
    const model=genAI.getGenerativeModel({
        model:"gemini-3.5-flash-lite"
    })
    const result=await model.generateContent(`Give me a short Abstract ,author name of the book ${title} in json format`)
    let replay=result.response.candidates[0].content.parts[0].text;
    console.log(replay);
    

    //Removing Markdown
    // replay=replay.replace(/```json\s*/gi,"").replace(/```/g,"").trim();

    const jsonData = JSON.parse(replay.match(/\{[\s\S]*\}/)[0]);

    //Convert string into JSON
    const bookData=jsonData
    console.log(bookData);


    //Extract ABSTRACT
    const abstract=bookData.abstract

    

    res.status(200).json({
        success:true,
        user:title,
        content:{abstract}
    })
}




