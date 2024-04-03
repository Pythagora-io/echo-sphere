const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'delete', 'lock', 'sticky', 'ban'
  target: { type: String, required: true }, // e.g., 'Post', 'Comment'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subSphere: { type: mongoose.Schema.Types.ObjectId, ref: 'SubSphere', required: true }, // Reference to SubSphere model
  timestamp: { type: Date, default: Date.now }
});

moderationLogSchema.pre('save', function(next) {
  console.log(`Saving moderation action: ${this.action} on target: ${this.target} with ID: ${this.targetId} by moderator ID: ${this.moderator} in SubSphere ID: ${this.subSphere}`);
  next();
});

moderationLogSchema.post('save', function(doc, next) {
  console.log(`Moderation action saved: ${doc.action} on target: ${doc.target} with ID: ${doc.targetId} by moderator ID: ${doc.moderator} in SubSphere ID: ${doc.subSphere}`);
  next();
});

moderationLogSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving moderation action: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('ModerationLog', moderationLogSchema);