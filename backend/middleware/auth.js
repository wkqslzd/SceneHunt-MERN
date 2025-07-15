const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Get token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ userID: decoded.userId });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user information to request object
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication token has expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify super admin permission
exports.isSuperAdmin = (req, res, next) => {
  if (!req.user.isSuperAdmin()) {
    return res.status(403).json({ message: '需要超级管理员权限' });
  }
  next();
};

// Verify admin permission (including super admin)
exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin()) {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// Verify super admin appointment permission
exports.canAppointSuperAdmin = (req, res, next) => {
  if (!req.user.canAppointSuperAdmin()) {
    return res.status(403).json({ message: '无权任命超级管理员' });
  }
  next();
};

// Verify admin appointment permission
exports.canAppointAdmin = (req, res, next) => {
  if (!req.user.canAppointAdmin()) {
    return res.status(403).json({ message: '无权任命管理员' });
  }
  next();
};

// Verify user management permission
exports.canManageUsers = (req, res, next) => {
  if (!req.user.canManageUsers()) {
    return res.status(403).json({ message: '无权管理用户' });
  }
  next();
};

// Verify connection review permission
exports.canReviewConnections = (req, res, next) => {
  if (!req.user.canReviewConnections()) {
    return res.status(403).json({ message: 'No permission to review connections' });
  }
  next();
}; 