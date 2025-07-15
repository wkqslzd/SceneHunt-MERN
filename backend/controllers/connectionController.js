const Connection = require('../models/Connection');
const Work = require('../models/Work');
const User = require('../models/User');
const mongoose = require('mongoose');

// Validate year relationship between works
const validateWorkYearRelationship = async (fromWorkId, toWorkId) => {
  const [fromWork, toWork] = await Promise.all([
    Work.findById(fromWorkId),
    Work.findById(toWorkId)
  ]);

  if (!fromWork || !toWork) {
    throw new Error('One or both works do not exist.');
  }

  // Upstream work's year must not be later than downstream work's year
  if (fromWork.year > toWork.year) {
    throw new Error('The year of the upstream work must not be later than the year of the downstream work.');
  }

  // Downstream work's year must not be earlier than upstream work's year
  if (toWork.year < fromWork.year) {
    throw new Error('The year of the downstream work must not be earlier than the year of the upstream work.');
  }

  return true;
};

// Create new connection
exports.createConnection = async (req, res) => {
  try {
    const { type, fromWork, toWork, imagesFrom, imagesTo, userComment } = req.body;
    
    // Check if the works exist
    const [fromWorkExists, toWorkExists] = await Promise.all([
      Work.findById(fromWork),
      Work.findById(toWork)
    ]);

    if (!fromWorkExists || !toWorkExists) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // Validate images
    if (!imagesFrom || !imagesTo) {
      return res.status(400).json({ message: 'Must provide source work and target work images' });
    }

    // Validate user comment
    if (!userComment || userComment.trim() === '') {
      return res.status(400).json({ message: 'Must provide connection explanation' });
    }

    // Determine connection level
    const connectionLevel = ['Adaptation', 'Sequel'].includes(type) ? 'primary' : 'secondary';

    // Check if the same type of connection already exists
    const existingSameTypeConnections = await Connection.find({
      $or: [
        { fromWork, toWork, type },
        { fromWork: toWork, toWork: fromWork, type }
      ],
      status: 'approved'
    });

    if (existingSameTypeConnections.length > 0) {
      return res.status(409).json({ 
        message: 'There is already a connection of the same type between these two works' 
      });
    }

    // Check if the primary connection already exists
    if (connectionLevel === 'primary') {
      const existingPrimaryConnections = await Connection.find({
        $or: [
          { fromWork, toWork },
          { fromWork: toWork, toWork: fromWork }
        ],
        connectionLevel: 'primary',
        status: 'approved'
      });

      if (existingPrimaryConnections.length > 0) {
        return res.status(409).json({ 
          message: 'There is already a primary connection between these two works (adaptation or sequel)' 
        });
      }
    } else {
      // Check if the primary connection already exists
      const existingPrimaryConnections = await Connection.find({
        $or: [
          { fromWork, toWork },
          { fromWork: toWork, toWork: fromWork }
        ],
        connectionLevel: 'primary',
        status: 'approved'
      });

      if (existingPrimaryConnections.length > 0) {
        return res.status(409).json({ 
          message: 'There is already a primary connection between these two works (adaptation or sequel), cannot establish a secondary connection' 
        });
      }
    }

    // Validate year relationship
    try {
      await validateWorkYearRelationship(fromWork, toWork);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Create connection
    const connection = new Connection({
      type,
      connectionLevel,
      fromWork,
      toWork,
      imagesFrom,
      imagesTo,
      userComment,
      createdBy: req.user._id
    });

    await connection.save();

    // Update user's postHistory
    await User.findOneAndUpdate(
      { userID: req.user.userID },
      { $push: { 'postHistory.pending': connection._id } }
    );

    // Update work relationships
    await Promise.all([
      Work.findByIdAndUpdate(fromWork, {
        $push: { downstreamWorks: { work: toWork, type } }
      }),
      Work.findByIdAndUpdate(toWork, {
        $push: { upstreamWorks: { work: fromWork, type } }
      })
    ]);

    // Trigger AI verification asynchronously
    // TODO: Implement AI verification logic

    res.status(201).json(connection);
  } catch (error) {
    console.error('Create connection error:', error);
    res.status(400).json({
      message: 'Failed to create connection',
      error: error.message
    });
  }
};

// Get a single connection
exports.getConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id)
      .populate('fromWork', 'title year')
      .populate('toWork', 'title year');

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Check access permission
    if (connection.status !== 'approved' && 
        connection.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No access' });
    }

    res.json(connection);
  } catch (error) {
    console.error('Get connection error:', error);
    res.status(500).json({
      message: 'Failed to get connection',
      error: error.message
    });
  }
};

// Get all connections of a user
exports.getUserConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ createdBy: req.params.userId })
      .populate('fromWork')
      .populate('toWork')
      .sort({ createdAt: -1 });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending connections
exports.getPendingConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ status: 'pending' })
      .populate('fromWork')
      .populate('toWork')
      .populate('createdBy', 'username nickname avatar')
      .sort({ createdAt: 1 });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review connection
exports.reviewConnection = async (req, res) => {
  try {
    const { decision, reviewComment } = req.body;
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection does not exist.' });
    }

    // If approving, validate year relationship again
    if (decision === 'approved') {
      try {
        await validateWorkYearRelationship(connection.fromWork, connection.toWork);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    // If approving, check if the primary connection exists
    if (decision === 'approved') {
      // Check if the primary connection exists
      const existingPrimaryConnections = await Connection.find({
        $or: [
          { fromWork: connection.fromWork, toWork: connection.toWork },
          { fromWork: connection.toWork, toWork: connection.fromWork }
        ],
        connectionLevel: 'primary',
        status: 'approved'
      });

      // If the current connection is a secondary connection and a primary connection already exists, reject
      if (connection.connectionLevel === 'secondary' && existingPrimaryConnections.length > 0) {
        connection.status = 'rejected';
        connection.adminReview = {
          reviewedBy: req.user._id,
          decision: 'rejected',
          reviewComment: 'There is already a primary connection (adaptation or sequel), cannot establish a secondary connection',
          reviewedAt: new Date()
        };
        await connection.save();
        return res.json(connection);
      }

      // If the current connection is a primary connection and a primary connection already exists, reject
      if (connection.connectionLevel === 'primary' && existingPrimaryConnections.length > 0) {
        connection.status = 'rejected';
        connection.adminReview = {
          reviewedBy: req.user._id,
          decision: 'rejected',
          reviewComment: 'There is already a primary connection (adaptation or sequel), cannot establish another primary connection',
          reviewedAt: new Date()
        };
        await connection.save();
        return res.json(connection);
      }
    }

    // Update connection status
    connection.status = decision === 'approved' ? 'approved' : 'rejected';
    connection.adminReview = {
      reviewedBy: req.user._id,
      decision,
      reviewComment,
      reviewedAt: new Date()
    };

    await connection.save();

    // Update user's postHistory
    const user = await User.findById(connection.createdBy);
    user.postHistory.pending = user.postHistory.pending.filter(
      id => id.toString() !== connection._id.toString()
    );
    user.postHistory[decision === 'approved' ? 'approved' : 'rejected'].push(connection._id);
    await user.save();

    // If approving, update work relationships
    if (decision === 'approved') {
      try {
        console.log('Updating works with connection:', {
          fromWork: connection.fromWork,
          toWork: connection.toWork,
          type: connection.type
        });

        // Check if fromWork exists
        const fromWorkExists = await Work.findById(connection.fromWork);
        if (!fromWorkExists) {
          throw new Error('fromWork not found');
        }

        // Check if toWork exists
        const toWorkExists = await Work.findById(connection.toWork);
        if (!toWorkExists) {
          throw new Error('toWork not found');
        }

        // Update fromWork's downstreamWorks
        const updatedFromWork = await Work.findOneAndUpdate(
          {
            _id: connection.fromWork,
            'downstreamWorks.work': { $ne: connection.toWork }
          },
          {
            $addToSet: {
              downstreamWorks: {
                work: connection.toWork,
                type: connection.type
              }
            }
          },
          { new: true }
        );

        console.log('Updated fromWork:', updatedFromWork);

        // Update toWork's upstreamWorks
        const updatedToWork = await Work.findOneAndUpdate(
          {
            _id: connection.toWork,
            'upstreamWorks.work': { $ne: connection.fromWork }
          },
          {
            $addToSet: {
              upstreamWorks: {
                work: connection.fromWork,
                type: connection.type
              }
            }
          },
          { new: true }
        );

        console.log('Updated toWork:', updatedToWork);

        if (!updatedFromWork || !updatedToWork) {
          throw new Error('Failed to update works');
        }
      } catch (error) {
        console.error('Update error:', error);
        throw error;
      }
    }

    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get connections between two works
exports.getConnections = async (req, res) => {
  try {
    const { fromWork, toWork } = req.query;

    if (!fromWork || !toWork) {
      return res.status(400).json({ message: 'Must provide fromWork and toWork parameters' });
    }

    const connections = await Connection.find({
      $or: [
        { fromWork, toWork },
        { fromWork: toWork, toWork: fromWork }
      ]
    })
    .populate('fromWork')
    .populate('toWork')
    .populate('createdBy', 'username nickname avatar')
    .sort({ createdAt: -1 });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update connection
exports.updateConnection = async (req, res) => {
  try {
    const { type, connectionLevel, imagesFrom, imagesTo, userComment } = req.body;
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // If works are being changed, validate year relationship
    if (req.body.fromWork && req.body.toWork) {
      await validateWorkYearRelationship(req.body.fromWork, req.body.toWork);
    }

    const updatedConnection = await Connection.findByIdAndUpdate(
      req.params.id,
      {
        type: type || connection.type,
        connectionLevel: connectionLevel || connection.connectionLevel,
        imagesFrom: imagesFrom || connection.imagesFrom,
        imagesTo: imagesTo || connection.imagesTo,
        userComment: userComment || connection.userComment,
        fromWork: req.body.fromWork || connection.fromWork,
        toWork: req.body.toWork || connection.toWork
      },
      { new: true }
    );

    res.json({
      message: 'Connection updated successfully',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(400).json({
      message: 'Failed to update connection',
      error: error.message
    });
  }
};

// Delete connection
exports.deleteConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Remove work references
    await Promise.all([
      Work.findByIdAndUpdate(connection.fromWork, {
        $pull: { downstreamWorks: { work: connection.toWork } }
      }),
      Work.findByIdAndUpdate(connection.toWork, {
        $pull: { upstreamWorks: { work: connection.fromWork } }
      })
    ]);

    await connection.remove();

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({
      message: 'Failed to delete connection',
      error: error.message
    });
  }
}; 