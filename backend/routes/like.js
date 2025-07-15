const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { isAuthenticated } = require('../middleware/auth');

// toggle like/unlike (need to login)
router.post('/toggle', isAuthenticated, likeController.toggleLike);

// get like count (public)
router.get('/count', likeController.getLikeCount);

// check if user has liked (need to login)
router.get('/check', isAuthenticated, likeController.checkUserLike);

module.exports = router; 