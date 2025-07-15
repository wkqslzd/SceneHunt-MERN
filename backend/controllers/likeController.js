const Like = require('../models/Like');
const Review = require('../models/Review');
const Connection = require('../models/Connection');
const ConnectionSubmission = require('../models/ConnectionSubmission');

// Like
exports.toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    // Verify if the target exists
    let targetExists = false;
    switch (targetType) {
      case 'review':
        targetExists = await Review.findById(targetId);
        break;
      case 'connectionComment':
        const connection = await Connection.findById(targetId);
        targetExists = connection && connection.connectionComment;
        break;
      case 'userComment':
        const userConnection = await Connection.findById(targetId);
        targetExists = userConnection && userConnection.userComment;
        break;
      case 'connectionSubmission':
        targetExists = await ConnectionSubmission.findById(targetId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid like target type' });
    }

    if (!targetExists) {
      return res.status(404).json({ message: 'Like target does not exist' });
    }

    // Check if the user has already liked
    const existingLike = await Like.findOne({
      user: userId,
      targetType,
      targetId
    });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      return res.json({
        success: true,
        message: 'Unlike successful',
        liked: false
      });
    } else {
      // Add like
      const newLike = new Like({
        user: userId,
        targetType,
        targetId
      });
      await newLike.save();
      return res.json({
        success: true,
        message: 'Like successful',
        liked: true
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Operation failed',
      error: error.message
    });
  }
};

// Get like count
exports.getLikeCount = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const count = await Like.countDocuments({ targetType, targetId });
    res.json({ count });
  } catch (error) {
    console.error('Get like count error:', error);
    res.status(500).json({
      message: 'Failed to get like count',
      error: error.message
    });
  }
};

// Check if the user has already liked
exports.checkUserLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const userId = req.user._id;

    const like = await Like.findOne({
      user: userId,
      targetType,
      targetId
    });

    res.json({ liked: !!like });
  } catch (error) {
    console.error('Check user like error:', error);
    res.status(500).json({
      message: 'Failed to check like status',
      error: error.message
    });
  }
}; 