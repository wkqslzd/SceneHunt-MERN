const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { 
  isAuthenticated, 
  isAdmin, 
  isSuperAdmin, 
  canAppointAdmin, 
  canManageUsers, 
  canReviewConnections 
} = require('../middleware/auth');

// Obtain the list of pending approvals (Super administrators and administrators)
router.get('/pending', isAuthenticated, canReviewConnections, adminController.getPendingApprovals);

// get approval history (super administrators and administrators)
router.get('/history', isAuthenticated, canReviewConnections, adminController.getApprovalHistory);

// get statistics (super administrators and administrators)
router.get('/stats', isAuthenticated, isAdmin, adminController.getStats);

// get all user list (only super administrators)
router.get('/users', isAuthenticated, canManageUsers, adminController.getAllUsers);

// transfer super administrator privileges (only the current super administrator)
router.post('/super-admin/transfer', isAuthenticated, isSuperAdmin, adminController.transferSuperAdmin);

// appoint or demote administrator (only super administrators)
router.post('/users/:userId/admin', isAuthenticated, canAppointAdmin, adminController.appointAdmin);

// force first login password change
router.post('/force-password-change', isAuthenticated, adminController.forcePasswordChange);

// delete user (only super administrators)
router.delete('/users/:userId', isAuthenticated, canManageUsers, adminController.deleteUser);

module.exports = router; 