const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const notificationHandler = require('../utils/notificationHandler');
const router = express.Router();

// POST route for creating a new comment
router.post('/createComment', isAuthenticated, async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
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

    // Use notificationHandler utility to create a notification for the post's author if the comment author is not the post's author
    if (post.author.toString() !== req.session.userId.toString()) {
      notificationHandler.createCommentNotification(newComment._id, req.app.get('socketio'));
    }

    res.redirect(`/posts/${postId}`); // Redirect to the post page
  } catch (error) {
    console.error('Error creating comment:', error);
    console.error(error.stack);
    res.status(500).send('Failed to create comment');
  }
});

// Add more routes as needed for editing and deleting comments

module.exports = router;