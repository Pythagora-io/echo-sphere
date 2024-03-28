const express = require('express');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Route to fetch all notifications for the logged-in user, excluding 'newMessage' type
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const notifications = await Notification.find({ user: userId, type: { $ne: 'newMessage' } }).sort('-timestamp');
    res.render('notifications', { notifications }); // Changed from res.json to res.render to display the notifications page
  } catch (error) {
    console.error('Error fetching notifications:', error.message, error.stack);
    res.status(500).render('error', { error: error }); // Changed to render an error page with the error details
  }
});

// New Route to fetch all unread notifications for the logged-in user as JSON
router.get('/all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const notifications = await Notification.find({ user: userId, isRead: false });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching all unread notifications:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch all unread notifications', error: error.message });
  }
});

// Route to mark a notification as read
router.post('/markAsRead', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
  }
});

// Route to mark all notifications as read, except 'newMessage' type
router.post('/markAllAsRead', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    await Notification.updateMany({ user: userId, type: { $ne: 'newMessage' } }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// Route to mark all 'newMessage' type notifications by the given username for the current user as read
router.post('/markAllMessagesAsRead', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.session.userId;
    const regex = new RegExp(`You have a new message from ${username}`);
    await Notification.updateMany({ user: userId, type: 'newMessage', content: { $regex: regex } }, { isRead: true });
    res.json({ success: true, message: `All messages from ${username} marked as read` });
  } catch (error) {
    console.error('Error marking all messages as read:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to mark all messages as read', error: error.message });
  }
});

module.exports = router;