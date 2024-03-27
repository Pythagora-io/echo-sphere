const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

notificationSchema.pre('save', function(next) {
  console.log(`Saving notification for user ${this.user}`);
  next();
});

notificationSchema.post('save', function(doc, next) {
  console.log(`Notification saved: ${doc._id}`);
  next();
});

notificationSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving notification: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Notification', notificationSchema);