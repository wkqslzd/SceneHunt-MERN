const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// create new connection
router.post('/', isAuthenticated, connectionController.createConnection);

// get connections between two works
router.get('/', isAuthenticated, connectionController.getConnections);

// get a single connection
router.get('/:id', isAuthenticated, connectionController.getConnection);

// get all connections of a user
router.get('/user/:userId', isAuthenticated, connectionController.getUserConnections);

// get pending connections (only administrators)
router.get('/pending', isAuthenticated, isAdmin, connectionController.getPendingConnections);

// review connection (only administrators)
router.patch('/:id/review', isAuthenticated, isAdmin, connectionController.reviewConnection);

module.exports = router; 