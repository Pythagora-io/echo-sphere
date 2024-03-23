const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'link', 'image', 'video'], required: true },
  content: { type: String, required: true }, // For 'link' type, this will store the URL. For 'image' and 'video', this will store the file path.
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  flairs: [{ type: String }],
  subSphere: { type: mongoose.Schema.Types.ObjectId, ref: 'SubSphere', required: true },
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['upvote', 'downvote'], required: true }
  }]
}, { timestamps: true });

postSchema.pre('save', function(next) {
  console.log(`Saving post of type: ${this.type} by author ID: ${this.author}`);
  // Recalculate upvotes and downvotes based on votes array
  this.upvotes = this.votes.filter(vote => vote.type === 'upvote').length;
  this.downvotes = this.votes.filter(vote => vote.type === 'downvote').length;
  next();
});

postSchema.post('save', function(doc, next) {
  console.log(`Post saved: ${doc._id}`);
  next();
});

postSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.error(`Error saving post: ${error.message}`);
    console.error(error.stack);
    next(new Error('There was a conflict in saving the post.'));
  } else if (error) {
    console.error(`Error saving post: ${error.message}`);
    console.error(error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Post', postSchema);