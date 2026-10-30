const bcrypt=require('bcrypt')
const users=require('../models/userModel');
const jwt = require('jsonwebtoken');



//Register 
exports.registerController=async(req,resp)=>{
    console.log("Inside registerController");
    console.log(req.body);
    const{username,email,password}=req.body

    //Check email in DB
    const existingUser=await users.findOne({email})
    if(existingUser){
        resp.status(409).json("User Already Exist... Please Login!")
    }else{
        // Insert New Document
        let encryptedPassword=await bcrypt.hash(password,10)
        const newUser=await users.create({
            username,email,password:encryptedPassword
        })
        resp.status(201).json(newUser)
    }

    resp.status(201).json("Register Request Recieved!")
}
//Login
exports.loginController=async(req,resp)=>{
    console.log("Inside Login Controller");
    console.log(req.body);
    
    const {email,password}=req.body
    console.log(email ,password);
    
    //Check Email in DB
    const existingUser=await users.findOne({email})
    if(existingUser){
        const isPasswordMatch=await bcrypt.compare(password,existingUser.password)
        if(isPasswordMatch){
            const token=jwt.sign({userMail:email,role:existingUser.role},process.env.JWTSECRET)
            resp.status(200).json({user:existingUser,token})
        }else{
            resp.status(409).json("Invalid Password..!")
        }
    }else{
        resp.status(409).json("Invalid Email...Please Register!!")
    }
    
}

//Google Login
exports.GoogleLoginController=async(req,resp)=>{
    console.log("Inside GoogleLoginController");
    const {email,password,picture,username}=req.body
    //Check Email in DB
    const existingUser=await users.findOne({email})
    if(existingUser){
        //If Present
        const token=jwt.sign({userMail:existingUser.email,role:existingUser.role},process.env.JWTSECRET)
        resp.status(200).json({user:existingUser,token})
    }else{
        //if not present
        let encryptedPassword=await bcrypt.hash(password,10)
        const newUser=await users.create({
            username,email,password:encryptedPassword,picture
        })
        const token=jwt.sign({userMail:newUser.email,role:newUser.role},process.env.JWTSECRET)
        resp.status(200).json({user:newUser,token})
    }
    
}

//user/admin edit
exports.userEditController=async(req,resp)=>{
    console.log("Inside userEditController");
    const {id}=req.params
    const email=req.payload
    const{username,password,bio,picture,role}=req.body
    const encryptedPassword=await bcrypt.hash(password,10)
    const uploadedPicture=req.file? req.file.filename :picture
    const updatedUser=await users.findByIdAndUpdate({_id:id},{username,email,password:encryptedPassword,picture:uploadedPicture,bio,role},{new:true})
    resp.status(200).json(updatedUser)
}

//Get All Users

exports.getAllUsers=async(req,res)=>{
    console.log("Inside getAllUsers");
    const email=req.payload
    const allUsers=await users.find({email:{$ne:email}})
    res.status(200).json(allUsers)
}




//Edit user
//Edit admin