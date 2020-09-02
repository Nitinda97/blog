const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feedController");
const isAuth=require("../middleware/isAuth");
const upload = require("../imageParsing");

const router = express.Router();
// get /feed/posts
router.get('/posts', isAuth.isAuthMiddleware, feedController.getPosts);

// get post by id
router.get('/post/:postId', feedController.getPost);

// Create a Post
router.post('/post', isAuth.isAuthMiddleware, upload.single('image'),
    [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })],
    feedController.createPost);

//update a Post
router.put('/post/:postId', upload.single('image'), 
    [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })],
    feedController.updatePost);

router.delete('/post/:postId',feedController.deletePost);
    
module.exports = router;

