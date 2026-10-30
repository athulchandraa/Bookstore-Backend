const express=require('express')
const cors=require('cors')
//.config for storeing in process.env
require('dotenv').config()

const routes=require('./Routes/allRoutes')
require("./config/db")


//ENABLE SERVER
const server=express()
//Enable cors
server.use(cors())

//Parse JSON to Js content
server.use(express.json())

//Use Routes
server.use(routes)

//Handling Static Foler
server.use('/Uploadss',express.static('./Uploadss'))

//PORT
const PORT=process.env.PORT

//Start Server
server.listen(PORT,()=>{
    console.log("Server Started...")
})

//Handling global error in server using application specific middleware
server.use((err,req,resp,next)=>{
    resp.status(500).json(err.message)
})

//Resolve API in browser useing get method
server.get('/',(req,resp)=>{
    resp.status(200).send("<h1>Server Started waiting for Request</h1>")
})

