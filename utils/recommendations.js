const Post = require('../models/Post');

async function getTrendingPosts(limit = 10) {
  try {
    const posts = await Post.find().sort({ upvotes: -1 }).limit(limit);
    console.log(`Fetched ${posts.length} trending posts.`);
    return posts;
  } catch (error) {
    console.error('Error fetching trending posts:', error.message, error.stack);
    throw error;
  }
}

module.exports = { getTrendingPosts };