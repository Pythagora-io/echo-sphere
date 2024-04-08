const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const crypto = require('crypto');
const { sendEmail } = require('../config/nodemailerSetup'); // Import sendEmail from nodemailerSetup
const router = express.Router();

// Configure multer for avatar file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;
    let avatarPath = '';
    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`;
    }
    // User model will automatically hash the password using bcrypt
    await User.create({ username, email, password, avatar: avatarPath, bio });
    console.log('User registered successfully');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login', { error: req.query.error });
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login attempt failed: User not found');
      return res.redirect('/auth/login?error=User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      console.log('User logged in successfully');
      return res.redirect('/');
    } else {
      console.log('Login attempt failed: Password is incorrect');
      return res.redirect('/auth/login?error=Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error(error.stack);
    return res.redirect('/auth/login?error=An error occurred');
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      console.error(err.stack);
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

// Forgot password route
router.get('/auth/forgot-password', (req, res) => {
  res.render('forgotPassword'); // Corrected view name
});

// Handle forgot password submission
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Forgot password attempt: User not found');
      return res.status(404).send('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Use sendEmail function from nodemailerSetup
    await sendEmail({
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM, // Use DEFAULT_EMAIL_FROM for the 'from' address
      subject: 'EchoSphere Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `http://${req.headers.host}/auth/reset-password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    });
    console.log('An e-mail has been sent to ' + user.email + ' with further instructions.');
    res.json({ success: true, message: 'An e-mail has been sent with further instructions.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error(error.stack);
    res.status(500).send('Error processing forgot password request');
  }
});

// Route to render the reset password form
router.get('/auth/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    console.log('Password reset token is invalid or has expired.');
    return res.render('error', { message: "The link you've clicked on has expired or is invalid. Please request a new password reset link." });
  }
  res.render('resetPasswordForm', { token });
});

// Route to handle the reset password form submission
router.post('/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    console.log('Password reset token is invalid or has expired.');
    return res.status(400).send('Password reset token is invalid or has expired.');
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  console.log('Password has been reset successfully.');
  res.redirect('/auth/login');
});

// Google Auth Routes
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google', { failureRedirect: '/auth/login' }), (req, res) => {
  req.session.userId = req.user._id; // Set the session userId after successful Google authentication
  // Successful authentication, redirect home.
  res.redirect('/');
});

module.exports = router;