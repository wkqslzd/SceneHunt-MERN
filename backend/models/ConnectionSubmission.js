const mongoose = require('mongoose');

const connectionSubmissionSchema = new mongoose.Schema({
  fromWork: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['book', 'screen'],
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  },
  toWork: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['book', 'screen'],
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  },
  direction: {
    type: String,
    enum: [
      "Work A (current page) is the inspiration for Work B (selected).",
      "Work B (selected) is the inspiration for Work A (current page)."
    ],
    required: true
  },
  type: {
    type: String,
    enum: ['Visual Homage', 'Quote Borrowing', 'Thematic Echo', 'Character Inspiration', 'Other'],
    required: true
  },
  userComment: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  aiJudgment: {
    type: String,
    maxlength: 2000
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decision: String,
    reviewComment: String,
    reviewedAt: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectionComment'
  }]
}, {
  timestamps: true
});

// Add indexes
connectionSubmissionSchema.index({ status: 1 });
connectionSubmissionSchema.index({ createdBy: 1 });
connectionSubmissionSchema.index({ 'fromWork._id': 1, 'toWork._id': 1 });

const ConnectionSubmission = mongoose.model('ConnectionSubmission', connectionSubmissionSchema);

module.exports = ConnectionSubmission; 