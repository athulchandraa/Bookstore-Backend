const jwt = require('jsonwebtoken');

const adminMiddleware=(req,resp,next)=>{
    console.log("Inside adminMiddleware");
    console.log(req.headers);
    
    const token=req.headers['authorization'].split(" ")[1]
    console.log(token);
    if(token){
        try{
        const jwtResponse=jwt.verify(token,process.env.JWTSECRET)
        console.log((jwtResponse));
        //Authentication Success anel mathram next kodukkanam
        req.payload=jwtResponse.userMail
        const role=jwtResponse.role
       if(role=="admin"){
         next()
       }else{
        resp.status(401).json("You are Not an ADMIN...")        
       }
    }catch(err){
        resp.status(401).json("Invalid Token....")
    }
    }else{
        resp.status(401).json("Not an authorized user, Token Missing....")
    }
}

module.exports=adminMiddleware