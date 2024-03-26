const express = require('express');
const router = express.Router();
const isAuthenticated = require('./middleware/authMiddleware').isAuthenticated;
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { v4: uuidv4 } = require('uuid');

// Route to get all chats for the logged-in user or initiate a chat with a specific user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const recipientId = req.query.recipientId;
    let selectedChatId = null;
    let messages = [];

    // Fetch chats where the current user is a participant
    const chats = await Chat.find({ participants: userId }).populate({
      path: 'participants',
      match: { _id: { $ne: userId } }, // Exclude the current user from the participants list
      select: 'username'
    });

    if (recipientId) {
      let chat = await Chat.findOne({ participants: { $all: [userId, recipientId] } });
      if (!chat) {
        // Create a new chat if it doesn't exist
        chat = new Chat({
          chatId: uuidv4(),
          participants: [userId, recipientId]
        });
        await chat.save();
      }
      selectedChatId = chat.chatId;
      messages = await Message.find({ chat: chat._id }).populate('sender', 'username');
    }

    res.render('messages', { chats, currentUser: userId, messages, selectedChatId });
  } catch (error) {
    console.error('Error fetching chats or initiating chat:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch chats or initiate chat');
  }
});

// Route to get messages for a specific chat
router.get('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findOne({ chatId: chatId });
    if (!chat) {
      return res.status(404).send('Chat not found');
    }
    const messages = await Message.find({ chat: chat._id }).populate('sender', 'username');
    if (messages.length === 0) {
      return res.status(404).send('Messages not found');
    }
    res.json({ success: true, messages, currentUser: req.session.userId });
  } catch (error) {
    console.error('Error fetching messages for chat:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch messages for chat');
  }
});

// Route to send a message
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return res.status(400).send('Content and Chat ID are required');
    }
    const chat = await Chat.findOne({ chatId: chatId });
    if (!chat) {
      return res.status(404).send('Chat not found');
    }
    const message = new Message({
      sender: req.session.userId,
      content,
      chat: chat._id
    });
    await message.save();

    // Emit the message to the chat using Socket.io
    const io = req.app.get('socketio');
    io.to(chat.chatId).emit('receiveMessage', { senderId: req.session.userId, message: content, chatId: chat.chatId });

    console.log(`Message sent from ${req.session.userId} to chat ${chat.chatId}: ${content}`);
    res.redirect(`/messages/${chat.chatId}`); // Redirect to the chat page
  } catch (error) {
    console.error('Error sending message:', error);
    console.error(error.stack);
    res.status(500).send('Failed to send message');
  }
});

// New Route to get all chats for the logged-in user
router.get('/chats/all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    // Fetch chats where the current user is a participant
    const chats = await Chat.find({ participants: userId }).populate('participants', 'username');
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching all chats:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch all chats', error: error.message });
  }
});

module.exports = router;