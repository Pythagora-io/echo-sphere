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

    // Check if the user has already voted
    const existingVoteIndex = document.votes.findIndex(vote => vote.user.toString() === userId);
    if (existingVoteIndex !== -1) {
      if (document.votes[existingVoteIndex].type === voteType) {
        // Undo the vote
        document.votes.splice(existingVoteIndex, 1);
      } else {
        // Change the vote
        document.votes[existingVoteIndex].type = voteType;
      }
    } else {
      // Add new vote
      document.votes.push({ user: userId, type: voteType });
    }

    // Recalculate upvotes and downvotes
    document.upvotes = document.votes.filter(vote => vote.type === 'upvote').length;
    document.downvotes = document.votes.filter(vote => vote.type === 'downvote').length;

    await document.save();

    // Determine the user's current vote status for response
    const userVoteStatus = document.votes.find(vote => vote.user.toString() === userId)?.type || 'none';

    console.log(`Vote processed: ${voteType} on ${documentType} by user ${userId}`);
    return { success: true, newVoteCount: document.upvotes - document.downvotes, userVoteStatus };
  } catch (error) {
    console.error('Error processing vote:', error.message, error.stack);
    throw error; // Rethrow the error after logging
  }
}

module.exports = handleVote;