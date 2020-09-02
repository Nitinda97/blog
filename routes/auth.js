const express = require("express");
const router = express.Router();
const User= require('../models/user');
const { body } = require("express-validator");

const authController = require("../controllers/authController");

router.post('/signup',[
    body('email').isEmail()
    .withMessage('Not a valid Email')
    .custom((value,{req})=>{

        return User.findOne({email:value}).then(user=>{

            if(user){
                return Promise.reject("Email Address Already Exists")
            }
        }
        );
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:4}),
    body('name').trim().not().isEmpty()],authController.registerUser);


    router.post("/login",[body('email').isEmail().withMessage('Not a valid Email').normalizeEmail(),body('password').trim().isLength({min:4})],authController.loginUser);

    module.exports=router;