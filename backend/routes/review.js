const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

// create or update a review
router.post('/', isAuthenticated, reviewController.createOrUpdateReview);

// get all reviews of a work
router.get('/work/:workId', reviewController.getWorkReviews);

// get all reviews of a user
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router; 