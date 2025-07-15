const express = require('express');
const router = express.Router();
const connectionCommentController = require('../controllers/connectionCommentController');
const { isAuthenticated } = require('../middleware/auth');

// Create a comment
router.post('/', isAuthenticated, connectionCommentController.createComment);

// get all comments related to a connection
router.get('/connection/:connectionId', connectionCommentController.getConnectionComments);

// update a comment
router.put('/:commentId', isAuthenticated, connectionCommentController.updateComment);

// delete a comment
router.delete('/:commentId', isAuthenticated, connectionCommentController.deleteComment);

module.exports = router; 