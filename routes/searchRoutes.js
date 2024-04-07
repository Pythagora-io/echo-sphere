const express = require('express');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const { getTrendingPosts, getRecommendations } = require('../utils/recommendations');
const router = express.Router();
const moment = require('moment');

router.get('/', asyncHandler(async (req, res) => {
  const { term, time, sort } = req.query;
  let timeFilter = {};

  if (time && time !== 'all') {
    let startDate;
    switch (time) {
      case 'day':
        startDate = moment().subtract(1, 'days');
        break;
      case 'week':
        startDate = moment().subtract(1, 'weeks');
        break;
      case 'month':
        startDate = moment().subtract(1, 'months');
        break;
      case 'year':
        startDate = moment().subtract(1, 'years');
        break;
      default:
        startDate = moment().subtract(100, 'years'); // Fallback to a long time ago
    }
    timeFilter = { createdAt: { $gte: startDate.toDate() } };
  }

  let sortOptions = {};
  if (sort === 'new') {
    sortOptions = { createdAt: -1 };
  } else if (sort === 'top') {
    // Adjusted sort options for 'top' to sort by upvotes - downvotes
    sortOptions = {};
  }

  try {
    if (term) {
      let posts = [];
      let comments = [];
      if (sort === 'top') {
        // Use aggregation pipeline for sorting posts and comments by 'top'
        posts = await Post.aggregate([
          { $match: { $or: [{ title: { $regex: term, $options: 'i' }}, { content: { $regex: term, $options: 'i' }}], ...timeFilter } },
          { $addFields: { totalVotes: { $subtract: ["$upvotes", "$downvotes"] } } },
          { $sort: { totalVotes: -1 } }
        ]);
        comments = await Comment.aggregate([
          { $match: { $text: { $search: term }, ...timeFilter } },
          { $addFields: { totalVotes: { $subtract: ["$upvotes", "$downvotes"] } } },
          { $sort: { totalVotes: -1 } }
        ]);
      } else {
        // Fallback to normal find for 'new' sort
        posts = await Post.find({ $or: [{ title: { $regex: term, $options: 'i' }}, { content: { $regex: term, $options: 'i' }}], ...timeFilter }).sort(sortOptions).populate('author');
        comments = await Comment.find({ $text: { $search: term }, ...timeFilter }).sort(sortOptions).populate('post').populate('author');
      }
      
      let subSphereSortOptions = {};
      if (sort === 'top') {
        subSphereSortOptions = { 'subscribers': -1 };
      } else {
        subSphereSortOptions = { 'createdAt': -1 };
      }
      const subSpheres = await SubSphere.find({ $text: { $search: term }, ...timeFilter }).sort(subSphereSortOptions);

      console.log(`Search results retrieved for term: ${term} within time: ${time} and sorted by: ${sort}`);
      res.render('searchResults', { posts, comments, subSpheres, term, time, sort });
    } else {
      console.log('No search term provided, displaying search form.');
      res.render('searchResults', { posts: [], comments: [], subSpheres: [], term: '', time: '', sort: '' });
    }
  } catch (error) {
    console.error('Error fetching search results:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch search results', error: error.message });
  }
}));

router.get('/trending', asyncHandler(async (req, res) => {
  try {
    const posts = await getTrendingPosts();
    res.json({ success: true, posts }); // Changed to return JSON
  } catch (error) {
    console.error('Error fetching trending posts:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch trending posts', error: error.message });
  }
}));

router.get('/recommendations', asyncHandler(async (req, res) => {
  try {
    const userId = req.session.userId;
    const subSpheres = await getRecommendations(userId);
    res.json({ success: true, subSpheres }); // Changed to return JSON
  } catch (error) {
    console.error('Error fetching recommendations:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
  }
}));

module.exports = router;