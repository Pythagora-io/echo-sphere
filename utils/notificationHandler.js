const Notification = require('../models/Notification');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Ensure Comment model is imported
const User = require('../models/User');

async function createCommentNotification(commentId, io) { // Add io parameter to function signature
  try {
    const comment = await Comment.findById(commentId).populate('post').populate('author');
    if (!comment) {
      console.log(`Comment with ID ${commentId} not found.`);
      return;
    }

    const postAuthorId = comment.post.author.toString();
    const commentAuthorId = comment.author._id.toString(); // Ensure correct access to author ID

    if (postAuthorId !== commentAuthorId) {
      const postAuthor = await User.findById(postAuthorId);
      if (!postAuthor) {
        console.log(`Post author with ID ${postAuthorId} not found.`);
        return;
      }

      const notification = new Notification({
        user: postAuthorId,
        type: 'newComment',
        content: `You have a new comment on your post by ${comment.author.username}`,
        isRead: false
      });

      await notification.save();

      console.log(`Notification for new comment created and saved for user ${postAuthor.username}.`);

      // Use the passed io instance to emit the notification
      io.to(postAuthorId).emit('notification', {
        type: 'newComment',
        content: notification.content,
        timestamp: notification.timestamp
      });

      console.log(`Notification event emitted for new comment to user ${postAuthor.username}.`);
    }
  } catch (error) {
    console.error('Error creating notification for new comment:', error.message);
    console.error(error.stack);
  }
}

module.exports = {
  createCommentNotification
};