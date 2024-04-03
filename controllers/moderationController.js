const ModerationLog = require('../models/ModerationLog');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubSphere = require('../models/SubSphere');
const User = require('../models/User');

exports.getModerationDashboardData = async (req, res) => {
  try {
    const userId = req.session.userId;
    // Fetch only the SubSpheres where the user is a moderator
    const moderatedSubSpheres = await SubSphere.find({ moderators: userId });

    // If a specific SubSphere is selected, fetch moderation logs for that SubSphere
    const selectedSubSphereId = req.query.subSphereId;
    let moderationLogs = [];
    if (selectedSubSphereId) {
      moderationLogs = await ModerationLog.find({ subSphere: selectedSubSphereId })
                                          .populate('moderator', 'username')
                                          .populate('targetId')
                                          .sort('-timestamp');
    }

    // Count documents for statistics
    let postCount, commentCount;
    if (selectedSubSphereId) {
      postCount = await Post.countDocuments({ subSphere: selectedSubSphereId });
      commentCount = await Comment.countDocuments({ subSphere: selectedSubSphereId });
    } else {
      postCount = await Post.countDocuments();
      commentCount = await Comment.countDocuments();
    }
    const userCount = await User.countDocuments();
    const subSphereCount = await SubSphere.countDocuments(); // Maintain the count of all SubSpheres

    console.log('Fetched moderation dashboard data successfully.');

    res.render('moderationDashboard', {
      moderatedSubSpheres,
      moderationLogs,
      counts: {
        postCount,
        commentCount,
        subSphereCount, // Include the count of all SubSpheres
        userCount
      },
      selectedSubSphereId
    });
  } catch (error) {
    console.error('Error fetching moderation dashboard data:', error.message, error.stack);
    res.status(500).send('Failed to load moderation dashboard data');
  }
};