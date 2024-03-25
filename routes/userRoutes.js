const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const User = require('../models/User');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

router.get('/users/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).send('User not found');
    }

    const posts = await Post.find({ author: userId }).populate('subSphere').exec();
    const comments = await Comment.find({ author: userId }).populate({
      path: 'post',
      populate: {
        path: 'subSphere',
        model: 'SubSphere'
      }
    }).exec();

    res.render('userPage', { user, posts, comments });
  } catch (error) {
    console.error('Error fetching user page:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch user page');
  }
});

module.exports = router;