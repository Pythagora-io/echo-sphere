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

    const isFollowing = user.followers.includes(req.session.userId);

    // Calculate user's karma
    let karma = 1; // Starting karma
    posts.forEach(post => {
      const otherUserVotes = post.votes.filter(vote => vote.user.toString() !== userId.toString());
      const upvotes = otherUserVotes.filter(vote => vote.type === 'upvote').length;
      const downvotes = otherUserVotes.filter(vote => vote.type === 'downvote').length;
      karma += upvotes - downvotes;
    });
    comments.forEach(comment => {
      const otherUserVotes = comment.votes.filter(vote => vote.user.toString() !== userId.toString());
      const upvotes = otherUserVotes.filter(vote => vote.type === 'upvote').length;
      const downvotes = otherUserVotes.filter(vote => vote.type === 'downvote').length;
      karma += upvotes - downvotes;
    });

    // Only show karma if the user is viewing their own profile
    const showKarma = userId.toString() === req.session.userId.toString();

    res.render('userPage', { user, posts, comments, isFollowing, karma, showKarma });
  } catch (error) {
    console.error('Error fetching user page:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch user page');
  }
});

// Route to follow a user
router.post('/follow/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.session.userId;
    // Update the current user's following array
    await User.findByIdAndUpdate(currentUser, { $addToSet: { following: userId } });
    // Update the followed user's followers array
    await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUser } });
    console.log(`User ${currentUser} followed user ${userId}`);
    res.redirect(`/users/${userId}`);
  } catch (error) {
    console.error('Error following user:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to follow user' });
  }
});

// Route to unfollow a user
router.post('/unfollow/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.session.userId;
    // Update the current user's following array
    await User.findByIdAndUpdate(currentUser, { $pull: { following: userId } });
    // Update the unfollowed user's followers array
    await User.findByIdAndUpdate(userId, { $pull: { followers: currentUser } });
    console.log(`User ${currentUser} unfollowed user ${userId}`);
    res.redirect(`/users/${userId}`);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to unfollow user' });
  }
});

module.exports = router;