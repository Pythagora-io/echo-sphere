const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['upvote', 'downvote'], required: true }
  }]
}, { timestamps: true });

commentSchema.pre('save', function(next) {
  console.log(`Saving comment by author ID: ${this.author}`);
  // Recalculate upvotes and downvotes based on votes array
  this.upvotes = this.votes.filter(vote => vote.type === 'upvote').length;
  this.downvotes = this.votes.filter(vote => vote.type === 'downvote').length;
  next();
});

commentSchema.post('save', function(doc, next) {
  console.log(`Comment saved: ${doc._id}`);
  next();
});

commentSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.error(`Error saving comment: ${error.message}`);
    console.error(error.stack);
    next(new Error('There was a conflict in saving the comment.'));
  } else if (error) {
    console.error(`Error saving comment: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Comment', commentSchema);