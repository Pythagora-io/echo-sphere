const express = require('express');
const { isAuthenticated, isModerator } = require('./middleware/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const ModerationLog = require('../models/ModerationLog');
const User = require('../models/User'); // For bans
const router = express.Router();

// Import the moderationController
const moderationController = require('../controllers/moderationController');

// Route handler for GET requests to '/moderation' that renders the 'moderationDashboard.ejs' view
router.get('/', isAuthenticated, moderationController.getModerationDashboardData);

// Example route for deleting a post (implement others similarly)
router.post('/deletePost/:postId', isAuthenticated, isModerator, async (req, res) => {
  const { postId } = req.params;
  const { subSphereId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post with ID ${postId} not found.`);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await Post.findByIdAndDelete(postId);
    await ModerationLog.create({
      action: 'delete',
      target: 'Post',
      targetId: postId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`Post with ID ${postId} deleted successfully.`);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.toString() });
  }
});

// Example route for locking a post
router.post('/lockPost/:postId', isAuthenticated, isModerator, async (req, res) => {
  const { postId } = req.params;
  const { subSphereId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post with ID ${postId} not found.`);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await SubSphere.findByIdAndUpdate(subSphereId, { $addToSet: { lockedPosts: postId } });
    await ModerationLog.create({
      action: 'lock',
      target: 'Post',
      targetId: postId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`Post with ID ${postId} locked successfully.`);
    res.json({ success: true, message: 'Post locked successfully' });
  } catch (error) {
    console.error('Error locking post:', error);
    res.status(500).json({ success: false, message: 'Failed to lock post', error: error.toString() });
  }
});

// Example route for stickying a post
router.post('/stickyPost/:postId', isAuthenticated, isModerator, async (req, res) => {
  const { postId } = req.params;
  const { subSphereId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post with ID ${postId} not found.`);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await SubSphere.findByIdAndUpdate(subSphereId, { $addToSet: { stickyPosts: postId } });
    await ModerationLog.create({
      action: 'sticky',
      target: 'Post',
      targetId: postId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`Post with ID ${postId} stickied successfully.`);
    res.json({ success: true, message: 'Post stickied successfully' });
  } catch (error) {
    console.error('Error stickying post:', error);
    res.status(500).json({ success: false, message: 'Failed to sticky post', error: error.toString() });
  }
});

// Example route for banning a user
router.post('/banUser/:userId', isAuthenticated, isModerator, async (req, res) => {
  const { userId } = req.params;
  const { subSphereId } = req.body;
  try {
    await SubSphere.findByIdAndUpdate(subSphereId, { $addToSet: { bannedUsers: userId } });
    await ModerationLog.create({
      action: 'ban',
      target: 'User',
      targetId: userId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`User with ID ${userId} banned successfully.`);
    res.json({ success: true, message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ success: false, message: 'Failed to ban user', error: error.toString() });
  }
});

// Route for unlocking a post
router.post('/unlockPost/:postId', isAuthenticated, isModerator, async (req, res) => {
  const { postId } = req.params;
  const { subSphereId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await SubSphere.findByIdAndUpdate(subSphereId, { $pull: { lockedPosts: postId } });
    await ModerationLog.create({
      action: 'unlock',
      target: 'Post',
      targetId: postId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`Post with ID ${postId} unlocked successfully.`);
    res.json({ success: true, message: 'Post unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking post:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock post', error: error.toString() });
  }
});

// Route for unsticking a post
router.post('/unstickyPost/:postId', isAuthenticated, isModerator, async (req, res) => {
  const { postId } = req.params;
  const { subSphereId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await SubSphere.findByIdAndUpdate(subSphereId, { $pull: { stickyPosts: postId } });
    await ModerationLog.create({
      action: 'unsticky',
      target: 'Post',
      targetId: postId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`Post with ID ${postId} unsticked successfully.`);
    res.json({ success: true, message: 'Post unsticked successfully' });
  } catch (error) {
    console.error('Error unsticking post:', error);
    res.status(500).json({ success: false, message: 'Failed to unsticky post', error: error.toString() });
  }
});

// Route for unbanning a user
router.post('/unbanUser/:userId', isAuthenticated, isModerator, async (req, res) => {
  const { userId } = req.params;
  const { subSphereId } = req.body;
  try {
    await SubSphere.findByIdAndUpdate(subSphereId, { $pull: { bannedUsers: userId } });
    await ModerationLog.create({
      action: 'unban',
      target: 'User',
      targetId: userId,
      moderator: req.session.userId,
      subSphere: subSphereId
    });
    console.log(`User with ID ${userId} unbanned successfully.`);
    res.json({ success: true, message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ success: false, message: 'Failed to unban user', error: error.toString() });
  }
});

// New route for '/stats' to return the total number of posts, comments, and banned users in the given SubSphere
router.get('/stats', isAuthenticated, async (req, res) => {
  const { subSphereId } = req.query;
  try {
    const subSphere = await SubSphere.findById(subSphereId);
    if (!subSphere) {
      console.log(`SubSphere with ID ${subSphereId} not found.`);
      return res.status(404).send('SubSphere not found');
    }
    const postsCount = await Post.countDocuments({ subSphere: subSphereId });
    const comments = await Comment.find().where('post').in(await Post.find({ subSphere: subSphereId }).select('_id')).exec();
    const commentsCount = comments.length;
    const bannedUsersCount = subSphere.bannedUsers.length;
    res.json({ success: true, stats: { postsCount, commentsCount, bannedUsersCount } });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).send('Failed to fetch stats');
  }
});

// Route to get moderation logs for a specific SubSphere
router.get('/logs', isAuthenticated, isModerator, async (req, res) => {
  const { subSphereId } = req.query;
  try {
    const logs = await ModerationLog.find({ subSphere: subSphereId })
      .populate('moderator', 'username')
      .sort('-timestamp');
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    res.status(500).send('Failed to fetch moderation logs');
  }
});

// Route to update SubSphere settings including automod configurations
router.post('/updateSubSphereSettings', isAuthenticated, isModerator, async (req, res) => {
  const { subSphereId, allowImages, allowVideos, allowTextPosts, minKarmaToPost } = req.body;
  try {
    await SubSphere.findByIdAndUpdate(subSphereId, {
      $set: {
        'settings.allowImages': allowImages,
        'settings.allowVideos': allowVideos,
        'settings.allowTextPosts': allowTextPosts,
        'settings.minKarmaToPost': minKarmaToPost
      }
    });
    console.log(`SubSphere settings updated successfully for SubSphere ID: ${subSphereId}`);
    res.json({ success: true, message: 'SubSphere settings updated successfully' });
  } catch (error) {
    console.error('Error updating SubSphere settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update SubSphere settings', error: error.toString() });
  }
});

module.exports = router;