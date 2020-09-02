const express= require("express");

const app=express()
const mongoose=require("mongoose");
const router = require("./routes/feed");
const authRout = require("./routes/auth");
const bodyParser=require("body-parser");
// parse application/json
app.use(bodyParser.json())
app.use("/feed",router);
app.use("/auth",authRout);

app.use((error,req,res,next)=>{
console.log(error);
res.status(error.statusCode).json({errorMessage : error.message, errorData : error.data});
})

const connectionURL="mongodb://127.0.0.1:27017/";
const dbName="blog";

//database connection & server startup
mongoose
.connect(`${connectionURL}${dbName}`,{ useUnifiedTopology: true, useNewUrlParser: true})
.then(result=>{
    app.listen(8080,'localhost',err=>{
        if(err)
        {console.log("Error on server setup ")}
        console.log("Server listening on port:8080")
        });
})
.catch(error=>{
    console.log(`database not connected ${error}`);
});

