const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = './public/uploads/';
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for avatar file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('Profile view: User not found');
      return res.status(404).send('User not found');
    }
    const success = req.query.success === 'true'; // Check for success query parameter
    res.render('profile', { user, success }); // Pass success flag to the template
  } catch (error) {
    console.error('Profile view error:', error.message);
    console.error(error.stack);
    res.status(500).send('Error fetching user profile');
  }
});

router.post('/profile', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    const { bio } = req.body;
    const settings = req.body.settings ? JSON.parse(req.body.settings) : {}; // Assuming settings are sent as JSON string
    const updateData = { bio, settings };
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    await User.findByIdAndUpdate(req.session.userId, updateData);
    console.log('Profile updated successfully');
    res.redirect('/profile?success=true'); // Redirect with success query parameter
  } catch (error) {
    console.error('Profile update error:', error.message);
    console.error(error.stack);
    res.status(500).send('Error updating user profile');
  }
});

router.post('/profile/change-theme', isAuthenticated, async (req, res) => {
  try {
    const currentTheme = req.session.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    req.session.theme = newTheme;
    await req.session.save();
    console.log(`Theme changed successfully to: ${newTheme}`);
    res.redirect('/profile');
  } catch (error) {
    console.error(`Error changing theme: ${error.message}`, error.stack);
    res.status(500).send('Error changing theme');
  }
});

module.exports = router;