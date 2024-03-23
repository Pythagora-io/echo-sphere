const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Function to handle voting logic for both posts and comments
async function handleVote(voteType, documentId, userId, documentType) {
  try {
    let documentModel;
    if (documentType === 'post') {
      documentModel = Post;
    } else if (documentType === 'comment') {
      documentModel = Comment;
    } else {
      throw new Error('Invalid document type');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const document = await documentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (voteType === 'upvote') {
      document.upvotes += 1;
      user.karma += 1; // Increment user's karma for upvote
    } else if (voteType === 'downvote') {
      document.downvotes += 1;
      user.karma -= 1; // Decrement user's karma for downvote, if needed
    } else {
      throw new Error('Invalid vote type');
    }

    await document.save();
    await user.save();

    console.log(`Vote processed: ${voteType} on ${documentType} by user ${userId}`);
  } catch (error) {
    console.error('Error processing vote:', error.message, error.stack);
    throw error; // Rethrow the error after logging
  }
}

module.exports = handleVote;