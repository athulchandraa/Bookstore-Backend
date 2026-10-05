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
            username,email,password:encryptedPassword,role:"admin"
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
//Edit user
//Edit admin