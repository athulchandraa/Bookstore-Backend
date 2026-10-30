const express=require('express')
const userController=require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const multerMiddleware = require('../middlewares/MulterMiddleware')
const bookController=require('../controllers/bookController')
const adminMiddleware = require('../middlewares/adminMiddleware')

//Object for Routerclass in express

const router=new express.Router()

//Register
router.post('/register',userController.registerController)

//Login
router.post('/login',userController.loginController)

//Google Login
router.post('/google-login',userController.GoogleLoginController)

//Get Home Books Router
router.get('/home-books',bookController.getHomeBooks)


//-----------------------------------------AUTHORIZED ACCESS------------------------------------------

//UserEdit Request
router.put('/user/:id',authMiddleware,multerMiddleware.single('picture'),userController.userEditController)

//Add Books
router.post('/book',authMiddleware,multerMiddleware.array('uploadImages',3),bookController.addBookController)

//Get all Books
router.get('/all-books',authMiddleware,bookController.getAllBooksController)

//Get UserBooks
router.get('/user-books',authMiddleware,bookController.getUserBookController)

//Get User Purchased Books
router.get('/purchased-books',authMiddleware,bookController.getUserPurchaseBookController)

//Delete User Uploaded Books
router.delete('/book/:id',authMiddleware,bookController.DeleteUploadedBooks)

//Get single Book
router.get('/view-book/:id',authMiddleware,bookController.viewBookController)

//book Payment
router.put('/book/:id/buy',authMiddleware,bookController.bookPaymentControl)

//API GEMINI ABSTRACT
router.post('/book-ai',authMiddleware,bookController.generateAbstrcatController)



// ---------------------------ADMIN EDIT-------------------------

//adminEdit Request
router.put('/admin/:id',adminMiddleware,multerMiddleware.single('picture'),userController.userEditController)

//all-users List 
router.get('/users-list',adminMiddleware,userController.getAllUsers)

//Get All Books 
router.get('/book-list',adminMiddleware,bookController.getAllBooks)

//update Book Status 
router.put('/book/:id',adminMiddleware,bookController.updateBookStatus)


module.exports=router