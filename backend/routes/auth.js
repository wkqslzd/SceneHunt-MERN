const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// register new user
router.post('/register', authController.register);

// user login
router.post('/login', authController.login);

// get current user information
router.get('/me', isAuthenticated, authController.getCurrentUser);

// user logout
router.post('/logout', isAuthenticated, authController.logout);

// reset password (placeholder)
router.post('/reset-password', authController.resetPassword);

module.exports = router; 