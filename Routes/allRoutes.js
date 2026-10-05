const express=require('express')
const userController=require('../controllers/userController')

//Object for Routerclass in express

const router=new express.Router()

//Register
router.post('/register',userController.registerController)

//Login
router.post('/login',userController.loginController)


module.exports=router