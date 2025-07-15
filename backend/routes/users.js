const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// register new user
router.post('/register', userController.register);

// user login
router.post('/login', userController.login);

// get user profile
router.get('/profile', isAuthenticated, userController.getProfile);

// update user profile
router.put('/profile', isAuthenticated, userController.updateProfile);

// update user password
router.put('/password', isAuthenticated, userController.updatePassword);

module.exports = router; 