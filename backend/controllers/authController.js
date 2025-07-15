const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, password, nickname, gender, birthDate } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate user ID
    const userID = uuidv4();

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      userID,
      username,
      password: hashedPassword,
      nickname,
      gender,
      birthDate,
      role: 'user',
      ratingCount: 0,
      connectionCount: 0,
      postHistory: {
        approved: [],
        rejected: [],
        pending: []
      }
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userID, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user information (excluding password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userID, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user information (excluding password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'User profile retrieved successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout (client deletes token)
exports.logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Reset password (placeholder)
exports.resetPassword = (req, res) => {
  res.status(501).json({ message: 'Feature not implemented' });
}; 