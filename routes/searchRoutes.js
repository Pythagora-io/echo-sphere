const express = require('express');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { term, time, sort } = req.query;
  try {
    if (term) {
      const posts = await Post.find({ $text: { $search: term } }).populate('author');
      const comments = await Comment.find({ $text: { $search: term } }).populate('post').populate('author');
      const subSpheres = await SubSphere.find({ $text: { $search: term } });
      console.log(`Search results retrieved for term: ${term}`);
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

module.exports = router;