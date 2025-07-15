const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    match: /^[a-zA-Z0-9]+$/,
    trim: true
  },
  userID: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    default: () => uuidv4()
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  },
  superAdminHistory: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferDate: {
      type: Date,
      default: Date.now
    }
  }],
  ratingCount: {
    type: Number,
    default: 0
  },
  connectionCount: {
    type: Number,
    default: 0
  },
  postHistory: {
    approved: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection'
    }],
    rejected: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection'
    }],
    pending: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection'
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Automatically update updatedAt when saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Password encryption middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if the user is a super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

// Check if the user is an admin (including super admin)
userSchema.methods.isAdmin = function() {
  return ['super_admin', 'admin'].includes(this.role);
};

// Check if the user can appoint an admin
userSchema.methods.canAppointAdmin = function() {
  return this.role === 'super_admin';
};

// Check if the user can manage users
userSchema.methods.canManageUsers = function() {
  return this.role === 'super_admin';
};

// Check if the user can review connections
userSchema.methods.canReviewConnections = function() {
  return ['super_admin', 'admin'].includes(this.role);
};

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this.userID },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Get user permission level
userSchema.methods.getPermissionLevel = function() {
  switch(this.role) {
    case 'super_admin':
      return 3; // Highest permission level
    case 'admin':
      return 2; // Medium permission level
    case 'user':
      return 1; // Basic permission level
    default:
      return 0; // No permission
  }
};

// Check if the user has the specified permission level
userSchema.methods.hasPermissionLevel = function(requiredLevel) {
  return this.getPermissionLevel() >= requiredLevel;
};

module.exports = mongoose.model('User', userSchema); 