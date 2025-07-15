const express = require('express');
const router = express.Router();
const connectionSubmissionController = require('../controllers/connectionSubmissionController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// create submission (need to login)
router.post('/', isAuthenticated, connectionSubmissionController.createSubmission);

// get all submissions (if you need to limit permissions, add isAuthenticated, isAdmin)
router.get('/', connectionSubmissionController.getAllSubmissions);

// get submissions of a specific work
router.get('/work', connectionSubmissionController.getSubmissionsByWork);

// get user's submissions (need to login)
router.get('/user/submissions', isAuthenticated, connectionSubmissionController.getUserSubmissions);

// get submission details
router.get('/:id', connectionSubmissionController.getSubmission);

// admin review submission (need admin permission)
router.post('/:id/review', isAuthenticated, isAdmin, connectionSubmissionController.reviewSubmission);

// delete submission (need admin permission)
router.delete('/:id', isAuthenticated, isAdmin, connectionSubmissionController.deleteSubmission);

module.exports = router; 