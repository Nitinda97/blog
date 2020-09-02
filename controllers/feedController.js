const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const path= require("path");
const fs=require("fs");
// const { delete, delete } = require("../routes/feed");
const { timeStamp } = require("console");


exports.getPosts = (req, res, next) => {

    Post.find()
        .then(posts => {
            res.status(200).json({ posts: posts });
        })
        .catch(err => {
            console.log(err);
            err.statusCode = 500;
            err.message = "Cannot Find Posts";
            next(err);
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            res.status(200).json({ post: post });
        })
        .catch(err => {
            err.statusCode = 500;
            err.message = "Cannot Find Post";
            console.log(err);
            next(err);
        });
}

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        if(req.file)
            {
                clearImage(req.file.path.replace("\\", "/"));
            }
        const error = new Error("Validation failed");
        error.statusCode = 422;
        throw error;
    }
    else {

        try{

        const userId = req.userId;
        const imageURL = req.file.path.replace("\\", "/");
        const post = new Post({

            title: req.body.title,
            content: req.body.content,
            imageUrl: imageURL,
            creator: userId
        });
        const result = await post.save();
        if(!result){

            const err = new Error("Post cannot be created");
            err.statusCode = 500;
            throw err;
        }

            const user = await User.findById(userId);

            if(!user){
                const err = new Error("Post cannot be created");
                err.statusCode = 500;
                throw err;
            }
            user.posts.push(result._id);
            const savedUser = await user.save();

            if(savedUser){
                res.status("201").json({post:result,createdBy:user._id});
            }

        }
        catch(err){

            err.statusCode=500;
            throw err;

        }
    }
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation Failed");
        err.statusCode = 422;
        throw err;
    }
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post)=>{
            post.title=req.body.title;
            post.content=req.body.content;
            if(req.file)
            {
                if(post.imageUrl)
                {
                    clearImage(post.imageUrl);
                }
                post.imageUrl=req.file.path;
            }
            post.save()
            .then(result=>{
                res.status(201).json(result);
            })
            .catch(err=>{
                console.log(err);
                err.statusCode=500;
                next(err);
            });
        })
        .catch(err=>{
            console.log(err);
            err.statusCode=500;
            next(err);
        });
}
async function temp(postId){
    try{
        let post=await Post.findById(postId);
        if(!post){
            const err=new Error("Could not find post");
            err.statusCode=404;
            throw err;
        }
        if(post.imageUrl)
        {
            if(post.imageUrl.length>0)
            clearImage(post.imageUrl);
        }
        await Post.findByIdAndRemove(postId);
        return true;
    }
    catch(err){
        err.statusCode=404;
        console.log(err);
        next(err);
    }
} 
exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;
    temp(postId).then(flag=>{
        if(flag)
        res.status(200).json("Post Deleted Successfully");
    }).catch(err=>{
        err.statusCode=500;
        console.log(err);
        next(err);
    });
    // Post.findById(postId)
    // .then((post)=>{
    //     if(!post){
    //         const err=new Error("Could not find post");
    //         err.statusCode=404;
    //         throw err;
    //     }
    //     if((post.imageUrl).length>0)
    //     {
    //         clearImage(post.imageUrl);
    //     }
    //     return Post.findByIdAndRemove(postId);
    // })
    // .then((post)=>{
    //     console.log(post);
    //     res.status(200).json("Post Deleted Successfully");
    // })
    // .catch(err=>{
    //     err.statusCode=500;
    //     console.log(err);
    //     next(err);
    // });
};


const clearImage=(imageUrl)=>{
const filepath=path.join(__dirname,"..",imageUrl);
fs.unlink(filepath,err=>{console.log(err)});
}