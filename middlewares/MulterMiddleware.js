const multer=require('multer')

//Define storage for uploaded files
const storage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'./Uploadss')
    },
    filename:(req,file,callback)=>{
        callback(null,`Image-${Date.now()}-${file.originalname}`)
    }
})

const fileFilter=(req,file,callback)=>{
    if(file.mimetype.startsWith("image/")){
        callback(null,true)
    }else{
        callback(null,false)
    }
}

const multerMiddleware=multer({
    storage,fileFilter
})

module.exports=multerMiddleware