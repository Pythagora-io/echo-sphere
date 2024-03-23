const express = require('express');
const multer = require('multer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Post = require('../models/Post');
const SubSphere = require('../models/SubSphere'); // Import SubSphere model to query available SubSpheres
const User = require('../models/User'); // Import User model to query subscribed SubSpheres
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
    // Fetch SubSpheres where the user is a moderator or subscribed to
    const user = await User.findById(req.session.userId).populate('subscribedSubSpheres').exec();
    const moderatorSubSpheres = await SubSphere.find({ moderators: req.session.userId }).exec();
    const subscribedSubSpheres = user.subscribedSubSpheres;
    const subSpheres = [...moderatorSubSpheres, ...subscribedSubSpheres.filter(subSphere => !moderatorSubSpheres.includes(subSphere))];
    if (subSpheres.length > 0) {
      res.render('posts/createPost', { subSpheres });
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
      subSphere: req.body.subSphere // Use the selected SubSphere from the dropdown
    });

    console.log(`New post created with ID: ${newPost._id}`);
    res.redirect('/'); // Redirect or send response as needed
  } catch (error) {
    console.error('Error creating a new post:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

// Add more routes as needed for editing and deleting posts

module.exports = router;