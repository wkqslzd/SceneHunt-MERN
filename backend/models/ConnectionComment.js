const mongoose = require('mongoose');

const connectionCommentSchema = new mongoose.Schema({
  connectionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ConnectionSubmission',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ConnectionComment', 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Automatically update updatedAt when saving
connectionCommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes to improve query performance
connectionCommentSchema.index({ connectionId: 1, createdAt: -1 });
connectionCommentSchema.index({ parentId: 1 });

const ConnectionComment = mongoose.model('ConnectionComment', connectionCommentSchema);

module.exports = ConnectionComment; 