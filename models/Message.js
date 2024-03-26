const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true } // Reference to Chat model
});

messageSchema.pre('save', function(next) {
  console.log(`Saving message from ${this.sender} in chat ${this.chat}`);
  next();
});

messageSchema.post('save', function(doc, next) {
  console.log(`Message saved: ${doc._id} in chat ${doc.chat}`);
  next();
});

messageSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving message: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);