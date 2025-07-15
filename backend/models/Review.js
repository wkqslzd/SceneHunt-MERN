const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  workId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Work', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: function() {
      return this.parentId === null; // Only required for root comments
    },
    min: 1, 
    max: 10 
  },
  comment: { 
    type: String, 
    default: '' 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review', 
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
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add a composite index to ensure that each user has only one root comment for each work
reviewSchema.index({ workId: 1, userId: 1, parentId: 1 }, { 
  unique: true,
  partialFilterExpression: { parentId: null }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 