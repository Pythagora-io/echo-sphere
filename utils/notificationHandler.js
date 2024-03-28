const Notification = require('../models/Notification');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Ensure Comment model is imported
const User = require('../models/User');
const Chat = require('../models/Chat'); // Ensure Chat model is imported
const Message = require('../models/Message'); // Ensure Message model is imported

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

async function createMessageNotification(messageId, chatId, io) {
  try {
    const message = await Message.findById(messageId).populate('sender');
    const chat = await Chat.findOne({ chatId: chatId }).populate('participants');
    if (!message || !chat) {
      console.log(`Message with ID ${messageId} or Chat with UUID ${chatId} not found.`);
      return;
    }

    chat.participants.forEach(async participant => {
      if (participant._id.toString() !== message.sender._id.toString()) {
        const notification = new Notification({
          user: participant._id,
          type: 'newMessage',
          content: `You have a new message from ${message.sender.username}`,
          isRead: false
        });

        await notification.save();

        console.log(`Notification for new message created and saved for user ${participant.username}.`);

        // Emit the notification to the participant's userId room
        io.to(participant._id.toString()).emit('notification', {
          type: 'newMessage',
          content: notification.content,
          timestamp: notification.timestamp
        });

        console.log(`Notification event emitted for new message to user ${participant.username}.`);
      }
    });
  } catch (error) {
    console.error('Error creating notification for new message:', error.message);
    console.error(error.stack);
  }
}

module.exports = {
  createCommentNotification,
  createMessageNotification
};