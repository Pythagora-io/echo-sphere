const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();
const handleVote = require('../utils/voteHandler'); // Assuming voteHandler.js is correctly implemented as per previous instructions

// Route to handle upvote for posts
router.post('/post/:id/upvote', async (req, res) => {
  try {
    const result = await handleVote('upvote', req.params.id, req.session.userId, 'post');
    res.json(result);
  } catch (error) {
    console.error('Error processing upvote for post:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to process upvote for post', error: error.message });
  }
});

// Route to handle downvote for posts
router.post('/post/:id/downvote', async (req, res) => {
  try {
    const result = await handleVote('downvote', req.params.id, req.session.userId, 'post');
    res.json(result);
  } catch (error) {
    console.error('Error processing downvote for post:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to process downvote for post', error: error.message });
  }
});

// Route to handle upvote for comments
router.post('/comment/:id/upvote', async (req, res) => {
  try {
    const result = await handleVote('upvote', req.params.id, req.session.userId, 'comment');
    res.json(result);
  } catch (error) {
    console.error('Error processing upvote for comment:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to process upvote for comment', error: error.message });
  }
});

// Route to handle downvote for comments
router.post('/comment/:id/downvote', async (req, res) => {
  try {
    const result = await handleVote('downvote', req.params.id, req.session.userId, 'comment');
    res.json(result);
  } catch (error) {
    console.error('Error processing downvote for comment:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to process downvote for comment', error: error.message });
  }
});

module.exports = router;