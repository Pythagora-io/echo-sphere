const SubSphere = require('../../models/SubSphere');

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Append the theme preference to the response locals
    res.locals.theme = req.session.theme || 'light';
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    // Redirect non-authenticated users to the login page instead of sending a 401 status
    return res.redirect('/auth/login'); // Redirect to login page
  }
};

const isModerator = async (req, res, next) => {
  try {
    const subSphereId = req.body.subSphereId || req.query.subSphereId;
    if (!subSphereId) {
      return res.status(400).send('SubSphere ID is required');
    }
    const subSphere = await SubSphere.findById(subSphereId);
    if (!subSphere) {
      return res.status(404).send('SubSphere not found');
    }
    if (subSphere.moderators.includes(req.session.userId)) {
      return next(); // User is a moderator, proceed to the next middleware/route handler
    } else {
      return res.status(403).send('You are not authorized to perform this action');
    }
  } catch (error) {
    console.error('Error checking moderator status:', error.message, error.stack);
    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  isAuthenticated,
  isModerator
};