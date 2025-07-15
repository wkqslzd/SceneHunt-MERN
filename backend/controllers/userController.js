const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password, nickname, gender, birthDate } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user
    const user = new User({
      username,
      password,
      nickname,
      gender,
      birthDate,
      role: username === 'admin' ? 'admin' : 'user' // If the username is admin, set it to admin
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userID },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        userID: user.userID,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userID },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userID: user.userID,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID })
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      userID: user.userID,
      avatar: user.avatar,
      nickname: user.nickname,
      gender: user.gender,
      birthDate: user.birthDate,
      bio: user.bio,
      ratingCount: user.ratingCount,
      connectionCount: user.connectionCount,
      postHistory: {
        approved: user.postHistory.approved,
        rejected: user.postHistory.rejected,
        pending: user.postHistory.pending
      },
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Only some fields can be updated
    const { nickname, gender, birthDate, bio, avatar } = req.body;
    if (nickname !== undefined) user.nickname = nickname;
    if (gender !== undefined) user.gender = gender;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ message: 'Data updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ userID: req.user.userID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    // Update new password
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 