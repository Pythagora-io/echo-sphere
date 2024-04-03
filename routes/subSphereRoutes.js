const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const SubSphere = require('../models/SubSphere');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

router.get('/createSubSphere', isAuthenticated, (req, res) => {
  res.render('createSubSphere');
});

router.post('/createSubSphere', isAuthenticated, async (req, res) => {
  try {
    const { name, description, flares, settings } = req.body;
    const newSubSphere = new SubSphere({
      name,
      description,
      moderators: [req.session.userId], // The creator becomes the first moderator
      flares: flares.split(','), // Assuming flares are submitted as comma-separated values
      settings,
      subscribers: [] // Initialize an empty subscribers list
    });
    await newSubSphere.save();
    console.log(`SubSphere ${name} created successfully.`);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating SubSphere:', error);
    console.error(error.stack);
    res.status(500).send('Failed to create SubSphere');
  }
});

router.get('/editSubSphere/:id', isAuthenticated, async (req, res) => {
  try {
    const subSphere = await SubSphere.findById(req.params.id);
    if (!subSphere.moderators.includes(req.session.userId)) {
      console.log('Unauthorized attempt to edit SubSphere.');
      return res.status(403).send('Unauthorized');
    }
    res.render('editSubSphere', { subSphere });
  } catch (error) {
    console.error('Error fetching SubSphere for editing:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch SubSphere details');
  }
});

router.post('/editSubSphere/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, flares, settings } = req.body;
    const subSphere = await SubSphere.findById(req.params.id);
    if (!subSphere.moderators.includes(req.session.userId)) {
      console.log('Unauthorized attempt to update SubSphere.');
      return res.status(403).send('Unauthorized');
    }
    await SubSphere.findByIdAndUpdate(req.params.id, {
      name,
      description,
      flares: flares.split(','),
      settings
    });
    console.log(`SubSphere ${name} updated successfully.`);
    res.redirect('/');
  } catch (error) {
    console.error('Error updating SubSphere:', error);
    console.error(error.stack);
    res.status(500).send('Failed to update SubSphere');
  }
});

router.get('/subSpheresList', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const moderatedSubSpheres = await SubSphere.find({ moderators: user._id });
    const subscribedSubSpheres = await SubSphere.find({ subscribers: user._id });
    res.render('subSpheresList', { moderatedSubSpheres, subscribedSubSpheres });
  } catch (error) {
    console.error('Error fetching SubSpheres list:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch SubSpheres list');
  }
});

router.get('/subSphere/:subSphereId/posts', isAuthenticated, async (req, res) => {
  try {
    const subSphereId = req.params.subSphereId;
    const posts = await Post.find({ subSphere: subSphereId }).populate('author');
    const subSphere = await SubSphere.findById(subSphereId);
    const isSubscribed = subSphere.subscribers.some(subscriber => subscriber.equals(req.session.userId));
    res.render('subSpherePosts', { posts, subSphere, isSubscribed });
  } catch (error) {
    console.error('Error fetching posts for SubSphere:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch posts for SubSphere');
  }
});

router.post('/subscribeToSubSphere', isAuthenticated, async (req, res) => {
  try {
    const { subSphereId } = req.body;
    await SubSphere.findByIdAndUpdate(subSphereId, { $addToSet: { subscribers: req.session.userId } });
    console.log(`User ${req.session.userId} subscribed to SubSphere ${subSphereId}`);
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error subscribing to SubSphere:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
});

router.post('/unsubscribeFromSubSphere', isAuthenticated, async (req, res) => {
  try {
    const { subSphereId } = req.body;
    await SubSphere.findByIdAndUpdate(subSphereId, { $pull: { subscribers: req.session.userId } });
    console.log(`User ${req.session.userId} unsubscribed from SubSphere ${subSphereId}`);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing from SubSphere:', error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
});

// New endpoint to get SubSphere details excluding subscribers
router.get('/subSphere/:subSphereId/details', isAuthenticated, async (req, res) => {
  try {
    const subSphereId = req.params.subSphereId;
    const subSphereDetails = await SubSphere.findById(subSphereId).select('-subscribers');
    if (!subSphereDetails) {
      console.log(`SubSphere with ID ${subSphereId} not found.`);
      return res.status(404).send('SubSphere not found');
    }
    console.log(`SubSphere details for ${subSphereId} fetched successfully.`);
    res.json(subSphereDetails);
  } catch (error) {
    console.error('Error fetching SubSphere details:', error);
    console.error(error.stack);
    res.status(500).send('Failed to fetch SubSphere details');
  }
});

module.exports = router;