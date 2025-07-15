const express = require('express');
const router = express.Router();
const Work = require('../models/Work');
const mongoose = require('mongoose');
const workController = require('../controllers/workController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Debug: Print the received requests and parameters
router.use((req, res, next) => {
  console.log('Received the route request from works:', req.method, req.originalUrl, req.params);
  next();
});

// public route (no authentication required)
router.get('/search', workController.searchWorks);

// get all works
router.get('/', workController.getWorks);

// primary connection management (need admin permission)
router.post('/:id/primary-connections', isAuthenticated, isAdmin, workController.addPrimaryConnection);
router.put('/:id/primary-connections/:connectionId', isAuthenticated, isAdmin, workController.updatePrimaryConnection);
router.delete('/:id/primary-connections/:connectionId', isAuthenticated, isAdmin, workController.deletePrimaryConnection);

// get a single work
router.get('/:id', workController.getWorkDetail);

// create a new work (need authentication)
router.post('/', isAuthenticated, workController.createWork);

// update a work (need authentication and admin permission)
router.patch('/:id', isAuthenticated, isAdmin, workController.updateWork);
router.put('/:id', async (req, res) => {
  try {
    const work = await Work.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }
    res.json(work);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete a work (need admin permission)
router.delete('/:id', isAuthenticated, isAdmin, workController.deleteWork);

// add work connections
router.post('/:id/connections', async (req, res) => {
  try {
    const { connectionType, targetWorkId, type } = req.body;
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    const targetWork = await Work.findById(targetWorkId);
    if (!targetWork) {
      return res.status(404).json({ message: 'Target work not found' });
    }

    // use transaction to ensure both updates succeed
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (connectionType === 'upstream') {
        // add upstream work relationship
        await Work.findByIdAndUpdate(
          work._id,
          {
            $addToSet: {
              upstreamWorks: {
                work: targetWorkId,
                type: type
              }
            }
          },
          { session }
        );

        // add downstream work relationship
        await Work.findByIdAndUpdate(
          targetWorkId,
          {
            $addToSet: {
              downstreamWorks: {
                work: work._id,
                type: type
              }
            }
          },
          { session }
        );
      } else if (connectionType === 'downstream') {
        // add downstream work relationship
        await Work.findByIdAndUpdate(
          work._id,
          {
            $addToSet: {
              downstreamWorks: {
                work: targetWorkId,
                type: type
              }
            }
          },
          { session }
        );

        // add upstream work relationship
        await Work.findByIdAndUpdate(
          targetWorkId,
          {
            $addToSet: {
              upstreamWorks: {
                work: work._id,
                type: type
              }
            }
          },
          { session }
        );
      }

      await session.commitTransaction();
      const updatedWork = await Work.findById(work._id);
      res.json(updatedWork);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 