const express = require('express');
const router = express.Router();
const themeController = require('../controllers/ThemeController');

// Logging the request for theme change
router.post('/api/theme', (req, res, next) => {
  console.log(`Request received to change theme to: ${req.body.theme}`);
  next();
}, themeController.changeTheme);

module.exports = router;