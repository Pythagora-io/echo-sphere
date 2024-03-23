const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const SubSphere = require('../models/SubSphere');
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
      settings
    });
    await newSubSphere.save();
    console.log(`SubSphere ${name} created successfully.`);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating SubSphere:', error);
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
    res.status(500).send('Failed to update SubSphere');
  }
});

module.exports = router;