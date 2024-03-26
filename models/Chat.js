const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const chatSchema = new mongoose.Schema({
  chatId: { type: String, default: uuidv4, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

chatSchema.pre('save', function(next) {
  console.log(`Saving chat with ID: ${this.chatId}`);
  next();
});

chatSchema.post('save', function(doc, next) {
  console.log(`Chat saved: ${doc.chatId}`);
  next();
});

chatSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving chat: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Chat', chatSchema);