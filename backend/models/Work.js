const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['book', 'screen']
  },
  year: {
    type: Number,
    required: true
  },
  genre: [{
    type: String,
    enum: [
      'Romance',        // love
      'Drama',          // drama
      'Comedy',         // comedy
      'Tragedy',        // tragedy
      'Action',         // action
      'Adventure',      // adventure
      'Fantasy',        // fantasy
      'Science Fiction', // science fiction
      'Mystery',        // mystery
      'Historical',     // historical
      'Horror',         // horror
      'War',            // war
      'Thriller',       // thriller
      'Crime',          // crime
      'SliceOfLife',    // slice of life
      'Psychological',  // psychological
      'Philosophical',  // philosophical
      'ComingOfAge',    // coming of age
      'Political',      // political
      'Satire',         // satire
      'Nature',         // nature
      'Other'           // other
    ]
  }],
  language: {
    type: String,
    required: true
  },
  coverImages: [{
    type: String,
    required: true
  }],
  // book specific fields
  author: {
    type: String,
    required: function() {
      return this.type === 'book';
    }
  },
  // screen specific fields
  director: {
    type: String,
    required: function() {
      return this.type === 'screen';
    }
  },
  actors: [{
    type: String
  }],
  releaseDate: {
    type: Date,
    required: function() {
      return this.type === 'screen';
    }
  },
  // Primary connection (can only be managed in the details page)
  primaryUpstreamWorks: [{
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work'
    },
    type: {
      type: String,
      enum: ['Adaptation', 'Sequel']
    }
  }],
  primaryDownstreamWorks: [{
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work'
    },
    type: {
      type: String,
      enum: ['Adaptation', 'Sequel']
    }
  }],
  // Secondary connection (can only be created through submission)
  secondaryUpstreamWorks: [{
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work'
    },
    type: {
      type: String,
      enum: ['Visual Homage', 'Quote Borrowing', 'Thematic Echo', 'Character Inspiration', 'Other']
    }
  }],
  secondaryDownstreamWorks: [{
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work'
    },
    type: {
      type: String,
      enum: ['Visual Homage', 'Quote Borrowing', 'Thematic Echo', 'Character Inspiration', 'Other']
    }
  }],
  // rating related
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
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

// update updatedAt automatically
workSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// add indexes
workSchema.index({ title: 1 });
workSchema.index({ type: 1 });
workSchema.index({ genre: 1 });
workSchema.index({ year: 1 });
workSchema.index({ 'primaryUpstreamWorks.work': 1 });
workSchema.index({ 'primaryDownstreamWorks.work': 1 });
workSchema.index({ 'secondaryUpstreamWorks.work': 1 });
workSchema.index({ 'secondaryDownstreamWorks.work': 1 });

module.exports = mongoose.model('Work', workSchema); 