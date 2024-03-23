const express = require('express');
const multer = require('multer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Import Comment model for fetching comments
const SubSphere = require('../models/SubSphere'); // Import SubSphere model to query available SubSpheres
const User = require('../models/User'); // Import User model for user-specific queries
const mongoose = require('mongoose'); // Import mongoose to use ObjectId for comparison
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = './public/uploads/posts/';
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('image') || file.mimetype.includes('video')) {
    cb(null, true);
  } else {
    cb(null, false);
    req.fileValidationError = 'Forbidden file type. Only images and videos are allowed.';
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET route for the create post page
router.get('/createPost', isAuthenticated, async (req, res) => {
  try {
    const allSubSpheres = await SubSphere.find();
    const userSubscribedSubSpheres = allSubSpheres.filter(subSphere => subSphere.subscribers.map(subscriber => subscriber.toString()).includes(req.session.userId.toString()));
    const moderatorSubSpheres = await SubSphere.find({ moderators: req.session.userId });
    const subSphereIds = [...new Set([...moderatorSubSpheres.map(sphere => sphere._id.toString()), ...userSubscribedSubSpheres.map(sphere => sphere._id.toString())])];
    const uniqueSubSpheres = await SubSphere.find({ '_id': { $in: subSphereIds } });
    if (uniqueSubSpheres.length > 0) {
      res.render('posts/createPost', { subSpheres: uniqueSubSpheres });
    } else {
      res.render('posts/createPost', { message: 'Please explore and join a SubSphere before creating a post.' });
    }
  } catch (error) {
    console.error('Error fetching SubSpheres:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch SubSpheres.');
  }
});

// POST route for creating a new post
router.post('/createPost', isAuthenticated, upload.single('content'), async (req, res) => {
  try {
    if (req.fileValidationError) {
      throw new Error(req.fileValidationError);
    }

    let postContent = req.body.content;
    if (['image', 'video'].includes(req.body.type)) {
      if (!req.file) {
        return res.status(400).send('File upload is required for image and video posts.');
      }
      postContent = `/uploads/posts/${req.file.filename}`;
    }

    const newPost = await Post.create({
      ...req.body,
      content: postContent,
      author: req.session.userId,
      subSphere: req.body.subSphere
    });

    console.log(`New post created with ID: ${newPost._id}`);
    res.redirect('/'); // Redirect or send response as needed
  } catch (error) {
    console.error('Error creating a new post:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

// GET route for viewing a single post's details along with its comments
router.get('/posts/:postId', isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('author');
    const comments = await Comment.find({ post: postId }).populate('author');
    if (!post) {
      console.log('Post not found');
      return res.status(404).send('Post not found');
    }
    res.render('posts/postDetails', { post, comments });
  } catch (error) {
    console.error('Error fetching post details:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch post details.');
  }
});

// GET route for viewing posts within a SubSphere
router.get('/subSphere/:subSphereId/posts', isAuthenticated, async (req, res) => {
  try {
    const subSphereId = req.params.subSphereId;
    const posts = await Post.find({ subSphere: subSphereId }).populate('author');
    const subSphere = await SubSphere.findById(subSphereId);
    const isSubscribed = subSphere.subscribers.includes(req.session.userId);
    res.render('subSpherePosts', { posts, subSphere, isSubscribed });
  } catch (error) {
    console.error('Error fetching posts for SubSphere:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch posts for SubSphere');
  }
});

module.exports = router;