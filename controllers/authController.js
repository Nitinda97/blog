const User= require('../models/user');
const {validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const { use } = require('../routes/feed');

const jwt = require("jsonwebtoken");



exports.registerUser = (req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        const err = new Error("validation failed");
        err.statusCode = 422;
        err.data = errors.array();
        throw err;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    saveUser(email,name,password).then((result)=>{
        res.status(201).json({message:"User Registered Successfully",user:result});

    }).catch(err=>{
        err.statusCode=500;
        err.message="Cannot Signup due to some internal error please try again later";
        next(err);
    });

}

exports.loginUser=(req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        const err = new Error("validation failed");
        err.statusCode = 422;
        err.data = errors.array();
        throw err;
    }


const email = req.body.email;
const password = req.body.password;

checkUser(email,password).then(token=>{
    res.status(200).json({message:"Success",token:token})
}).catch(err=>{
    next(err);
})

}

async function checkUser(email,password){

try{

const user = await User.findOne({email:email});

if(user){

    const check = await bcrypt.compare(password,user.password);

    if(!check)
    {
        const err= new Error("Wrong password");
        err.statusCode=404;
        return Promise.reject(err);
    }

    const token = await jwt.sign({email:email,userId:user._id},'secret',{expiresIn:60*60});

    return token;

}
else{
    const err= new Error("User does not exist");
    err.statusCode=404;
    return Promise.reject(err);
}

}

catch(err){

    err.message="Cannot Login";
    err.statusCode=500;
    return Promise.reject(err);

}


}

async function saveUser(email,name,password){

    try{
    
        const hashPassword= await bcrypt.hash(password,10);
    
        const user = new User({
            email:email,
            password:hashPassword,
            name:name,
            posts:[]
        });
    
        const result = await user.save();
    
        console.log(result);
    
        return result;
    
    
    }
    
    catch(err){
    
        return Promise.reject(err);
    
    }
}