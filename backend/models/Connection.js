const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Adaptation', 'Sequel', 'Visual Homage', 'Quote Borrowing', 'Thematic Echo', 'Character Inspiration', 'Other'],
    required: true
  },
  connectionLevel: {
    type: String,
    enum: ['primary', 'secondary'],
    required: true
  },
  fromWork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work',
    required: true
  },
  toWork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work',
    required: true
  },
  imagesFrom: {
    type: String,
    required: true
  },
  imagesTo: {
    type: String,
    required: true
  },
  userComment: {
    type: String,
    required: true,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Add indexes
connectionSchema.index({ connectionLevel: 1 });
connectionSchema.index({ submittedBy: 1 });
connectionSchema.index({ 'adminReview.reviewedBy': 1 });
connectionSchema.index(
  { fromWork: 1, toWork: 1, connectionLevel: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { connectionLevel: 'primary' }
  }
);

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection; 