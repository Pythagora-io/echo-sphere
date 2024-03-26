const Message = require('../models/Message');
const User = require('../models/User');

// Function to get message threads for the logged-in user
exports.getMessageThreads = async (req, res) => {
  try {
    const userId = req.session.userId;
    const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] })
                                   .populate('sender', 'username')
                                   .populate('recipient', 'username');
    const threads = {};
    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === userId ? message.recipient._id.toString() : message.sender._id.toString();
      if (!threads[otherUserId]) {
        threads[otherUserId] = {
          username: message.sender._id.toString() === userId ? message.recipient.username : message.sender.username,
          messages: []
        };
      }
      threads[otherUserId].messages.push(message);
    });
    res.json({ success: true, threads });
  } catch (error) {
    console.error('Error fetching message threads:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch message threads', error: error.message });
  }
};

// Function to get messages between the logged-in user and another user
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.userId;
    const messages = await Message.find({
      $or: [
        { $and: [{ sender: currentUserId }, { recipient: userId }] },
        { $and: [{ sender: userId }, { recipient: currentUserId }] }
      ]
    }).sort('timestamp');
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages with user:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch messages with user', error: error.message });
  }
};

// Function to send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.session.userId;
    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }
    const message = new Message({ sender: senderId, recipient: recipientId, content });
    await message.save();
    console.log(`Message sent from ${senderId} to ${recipientId}`);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};