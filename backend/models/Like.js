const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The type of the target being liked: 'review', 'connectionComment', 'userComment', 'connectionSubmission'
  targetType: {
    type: String,
    enum: ['review', 'connectionComment', 'userComment', 'connectionSubmission'],
    required: true
  },
  // The ID of the target being liked
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a composite index to ensure that a user can only like a target once
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema); 