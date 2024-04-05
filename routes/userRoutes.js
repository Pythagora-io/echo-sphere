const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const User = require('../models/User');
const Message = require('../models/Message'); // Import the Message model
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

    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate('subSphere').exec();
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

// Route to get a list of users who are recipients and conversating with the user
router.get('/recipients', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    // Find all messages where the logged-in user is either the sender or the recipient
    const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] });
    // Extract user IDs from messages
    const userIds = messages.reduce((acc, message) => {
      acc.add(message.sender.toString());
      acc.add(message.recipient.toString());
      return acc;
    }, new Set());
    // Remove the logged-in user's ID from the set
    userIds.delete(userId);
    // Find users based on extracted IDs
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('username _id');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users for messaging:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch users for messaging', error: error.message });
  }
});

module.exports = router;