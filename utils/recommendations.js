const Post = require('../models/Post');
const SubSphere = require('../models/SubSphere');
const User = require('../models/User');

async function getTrendingPosts(limit = 10) {
  try {
    const posts = await Post.find().sort({ upvotes: -1 }).limit(limit).populate('author', 'username');
    console.log(`Fetched ${posts.length} trending posts.`);
    return posts;
  } catch (error) {
    console.error('Error fetching trending posts:', error.message, error.stack);
    throw error;
  }
}

async function getRecommendations(userId, limit = 10) {
  try {
    const userSubscriptions = await SubSphere.find({ 'subscribers': userId });
    const subscribedSubSphereIds = userSubscriptions.map(subSphere => subSphere._id);
    const recommendations = await SubSphere.find({ _id: { $nin: subscribedSubSphereIds } })
                                           .sort({ subscribers: -1 })
                                           .limit(limit);
    console.log(`Fetched ${recommendations.length} recommended SubSpheres for user ${userId}.`);
    return recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error.message, error.stack);
    throw error;
  }
}

module.exports = { getTrendingPosts, getRecommendations };