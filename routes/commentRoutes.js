const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

// POST route for creating a new comment
router.post('/createComment', isAuthenticated, async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const postExists = await Post.findById(postId);
    if (!postExists) {
      console.log('Attempt to comment on a non-existent post');
      return res.status(404).send('Post not found');
    }
    const newComment = new Comment({
      content,
      author: req.session.userId,
      post: postId,
      parentComment: parentCommentId || null
    });
    await newComment.save();
    console.log('New comment created successfully');
    res.redirect(`/posts/${postId}`); // Redirect to the post page
  } catch (error) {
    console.error('Error creating comment:', error);
    console.error(error.stack);
    res.status(500).send('Failed to create comment');
  }
});

// Add more routes as needed for editing and deleting comments

module.exports = router;