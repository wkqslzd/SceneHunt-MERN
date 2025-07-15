const User = require('../models/User');
const Connection = require('../models/Connection');
const Work = require('../models/Work');
const mongoose = require('mongoose');

// Obtain the list of pending approval
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingConnections = await Connection.find({ status: 'pending' })
      .populate('fromWork')
      .populate('toWork')
      .populate('createdBy', 'username nickname');
    
    res.json(pendingConnections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approval history
exports.getApprovalHistory = async (req, res) => {
  try {
    const history = await Connection.find({
      status: { $in: ['approved', 'rejected'] }
    })
      .populate('fromWork')
      .populate('toWork')
      .populate('createdBy', 'username nickname')
      .populate('adminReview.reviewedBy', 'username nickname');
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConnections = await Connection.countDocuments();
    const pendingConnections = await Connection.countDocuments({ status: 'pending' });
    const approvedConnections = await Connection.countDocuments({ status: 'approved' });
    const rejectedConnections = await Connection.countDocuments({ status: 'rejected' });
    
    res.json({
      totalUsers,
      totalConnections,
      pendingConnections,
      approvedConnections,
      rejectedConnections
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all user list
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer super admin permissions
exports.transferSuperAdmin = async (req, res) => {
  try {
    const { newSuperAdminId, password } = req.body;
    
    // Verify that the current user is super_admin
    if (!req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Super administrator privileges are required' });
    }

    // Verify password
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Find the new super_admin
    const newSuperAdmin = await User.findOne({ userID: newSuperAdminId });
    if (!newSuperAdmin) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Check if the user is already super_admin
    if (newSuperAdmin.isSuperAdmin()) {
      return res.status(400).json({ message: 'The user is already a super administrator' });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the original super_admin to a regular admin
      req.user.role = 'admin';
      req.user.superAdminHistory.push({
        fromUser: req.user._id,
        toUser: newSuperAdmin._id,
        transferDate: new Date()
      });
      await req.user.save({ session });

      // Update the new super_admin
      newSuperAdmin.role = 'super_admin';
      newSuperAdmin.superAdminHistory.push({
        fromUser: req.user._id,
        toUser: newSuperAdmin._id,
        transferDate: new Date()
      });
      await newSuperAdmin.save({ session });

      await session.commitTransaction();
      
      res.json({ 
        message: 'Super administrator privileges transferred successfully',
        oldSuperAdmin: {
          userID: req.user.userID,
          username: req.user.username,
          newRole: 'admin'
        },
        newSuperAdmin: {
          userID: newSuperAdmin.userID,
          username: newSuperAdmin.username,
          newRole: 'super_admin'
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Appoint or demote admin
exports.appointAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'promote' 或 'demote'
    
    // Verify permissions
    if (!req.user.canAppointAdmin()) {
      return res.status(403).json({ message: 'No permission to manage admin roles' });
    }

    const user = await User.findOne({ userID: userId });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Cannot modify super admin role
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot modify super administrator role' });
    }

    // Update role based on action type
    if (action === 'promote' && user.role === 'user') {
      user.role = 'admin';
    } else if (action === 'demote' && user.role === 'admin') {
      user.role = 'user';
    } else {
      return res.status(400).json({ 
        message: 'Invalid operation',
        details: 'Only users can be promoted to admins, and admins can be demoted to users'
      });
    }

    await user.save();

    res.json({
      message: action === 'promote' ? 'Admin appointment successful' : 'Admin demotion successful',
      user: {
        userID: user.userID,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (only founder)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Verify role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Cannot modify founder role
    const user = await User.findOne({ userID: userId });
    if (user.role === 'founder') {
      return res.status(403).json({ message: 'Cannot modify founder role' });
    }

    // Update role
    user.role = role;
    await user.save();

    // Return the updated user information (excluding sensitive fields)
    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.__v;

    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Force first-time login to change password
exports.forcePasswordChange = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify the current password
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (only super admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Cannot delete super admin
    const user = await User.findOne({ userID: userId });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super administrator' });
    }
    await User.deleteOne({ userID: userId });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 