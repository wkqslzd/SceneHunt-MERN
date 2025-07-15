const ConnectionSubmission = require('../models/ConnectionSubmission');
const { upload, processImages } = require('../middleware/imageProcessing');
const aiService = require('../services/aiService');
const { validateConnectionSubmission } = require('../middleware/validation');
const Connection = require('../models/Connection');
const Work = require('../models/Work');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create connection submission
exports.createSubmission = [
  // 1. Process image upload
  upload.fields([
    { name: 'workAImage', maxCount: 1 },
    { name: 'workBImage', maxCount: 1 }
  ]),
  // 2. Process images
  processImages,
  // 3. Validate connection submission (includes year validation)
  // Note: Year validation is performed here, and if validation fails, the execution will not continue to the AI interface
  validateConnectionSubmission,
  // 4. Create submission and call AI
  async (req, res) => {
    try {
      const { workA, workB, direction, type, userComment } = req.body;
      
      // Determine the inspiration and affected work based on direction
      let fromWork, toWork;
      if (direction === "Work A (current page) is the inspiration for Work B (selected).") {
        fromWork = {
          _id: workA._id,
          title: workA.title,
          type: workA.type,
          year: workA.year,
          image: req.processedImages.workA.original // Buffer
        };
        toWork = {
          _id: workB._id,
          title: workB.title,
          type: workB.type,
          year: workB.year,
          image: req.processedImages.workB.original // Buffer
        };
      } else {
        fromWork = {
          _id: workB._id,
          title: workB.title,
          type: workB.type,
          year: workB.year,
          image: req.processedImages.workB.original // Buffer
        };
        toWork = {
          _id: workA._id,
          title: workA.title,
          type: workA.type,
          year: workA.year,
          image: req.processedImages.workA.original // Buffer
        };
      }
      
      // Check the image field
      if (!fromWork.image || !toWork.image) {
        console.error('[ERROR] fromWork.image or toWork.image is missing:', {
          fromWork,
          toWork
        });
        return res.status(400).json({
          success: false,
          message: 'fromWork.image or toWork.image is missing, cannot submit the submission.'
        });
      }

      // Use Buffer to participate in AI judgment
      let aiJudgment = await aiService.getAIJudgment({
        fromWork,
        toWork,
        type,
        userComment
      });
      // If it exceeds 2000 characters, truncate it
      if (typeof aiJudgment === 'string' && aiJudgment.length > 2000) {
        aiJudgment = aiJudgment.slice(0, 2000);
      }

      // Convert to base64 when storing in the database
      const submissionData = {
        fromWork: {
          _id: fromWork._id,
          title: fromWork.title,
          type: fromWork.type,
          year: fromWork.year,
          image: fromWork.image.toString('base64')
        },
        toWork: {
          _id: toWork._id,
          title: toWork.title,
          type: toWork.type,
          year: toWork.year,
          image: toWork.image.toString('base64')
        },
        direction,
        type,
        userComment,
        createdBy: req.user._id,
        status: 'pending',
        aiJudgment
      };

      // Create submission record
      const submission = new ConnectionSubmission(submissionData);
      await submission.save();

      // DEBUG: Print image type and value
      console.log('DEBUG fromWork.image:', fromWork.image, typeof fromWork.image);
      console.log('DEBUG toWork.image:', toWork.image, typeof toWork.image);

      res.status(201).json({
        success: true,
        data: submission
      });
    } catch (error) {
      console.error('Create submission error:', error);
      if (error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create connection submission'
      });
    }
  }
];

// Get all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await ConnectionSubmission.find()
      .populate('createdBy', 'username')
      .sort('-createdAt');

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions'
    });
  }
};

// Get a single submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await ConnectionSubmission.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Process the image field, convert Buffer to base64
    const fromWork = submission.fromWork || {};
    const toWork = submission.toWork || {};
    const fromWorkImage = fromWork.image && Buffer.isBuffer(fromWork.image)
      ? fromWork.image.toString('base64')
      : fromWork.image;
    const toWorkImage = toWork.image && Buffer.isBuffer(toWork.image)
      ? toWork.image.toString('base64')
      : toWork.image;

    // debug log
    console.log('[DEBUG] fromWork.image type:', typeof fromWork.image, Buffer.isBuffer(fromWork.image) ? 'Buffer' : 'Not Buffer');
    if (fromWork.image) {
      if (Buffer.isBuffer(fromWork.image)) {
        console.log('[DEBUG] fromWork.image buffer length:', fromWork.image.length);
        console.log('[DEBUG] fromWork.image buffer head:', fromWork.image.toString('base64').slice(0, 100));
      } else {
        console.log('[DEBUG] fromWork.image string length:', fromWork.image.length);
        console.log('[DEBUG] fromWork.image string head:', fromWork.image.slice(0, 100));
      }
    }
    console.log('[DEBUG] toWork.image type:', typeof toWork.image, Buffer.isBuffer(toWork.image) ? 'Buffer' : 'Not Buffer');
    if (toWork.image) {
      if (Buffer.isBuffer(toWork.image)) {
        console.log('[DEBUG] toWork.image buffer length:', toWork.image.length);
        console.log('[DEBUG] toWork.image buffer head:', toWork.image.toString('base64').slice(0, 100));
      } else {
        console.log('[DEBUG] toWork.image string length:', toWork.image.length);
        console.log('[DEBUG] toWork.image string head:', toWork.image.slice(0, 100));
      }
    }

    res.json({
      success: true,
      data: {
        ...submission.toObject(),
        fromWork: { ...fromWork, image: fromWorkImage },
        toWork: { ...toWork, image: toWorkImage }
      }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission'
    });
  }
};

// Update submission status
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    
    const submission = await ConnectionSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.status = status;
    submission.adminReview = {
      reviewedBy: req.user._id,
      status,
      comment: adminComment,
      reviewedAt: new Date()
    };

    await submission.save();

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status'
    });
  }
};

// Get user's submission list
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await ConnectionSubmission.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user submissions'
    });
  }
};

// Admin reviews submission
exports.reviewSubmission = async (req, res) => {
  try {
    const { decision, reviewComment } = req.body;
    const submission = await ConnectionSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This submission has already been reviewed'
      });
    }

    // Update submission status
    submission.status = decision;
    submission.adminReview = {
      reviewedBy: req.user._id,
      decision,
      reviewComment,
      reviewedAt: new Date()
    };

    await submission.save();

    // If approved, create Connection
    if (decision === 'approved') {
      const primaryTypes = ['Adaptation', 'Sequel'];
      if (!primaryTypes.includes(submission.type)) {
        const [fromWork, toWork] = submission.direction.includes("Work A (current page) is the inspiration")
          ? [submission.fromWork, submission.toWork]
          : [submission.toWork, submission.fromWork];

        console.log('[DEBUG] Creating secondary connection:', {
          type: submission.type,
          connectionLevel: 'secondary',
          fromWork: fromWork._id,
          toWork: toWork._id,
          imagesFrom: fromWork.image,
          imagesTo: toWork.image,
          userComment: submission.userComment,
          createdBy: submission.createdBy
        });

        const connection = new Connection({
          type: submission.type,
          connectionLevel: 'secondary',
          fromWork: fromWork._id,
          toWork: toWork._id,
          imagesFrom: fromWork.image,
          imagesTo: toWork.image,
          userComment: submission.userComment,
          submittedBy: submission.createdBy,
          adminReview: {
            reviewedBy: req.user._id,
            decision,
            reviewComment,
            reviewedAt: new Date()
          }
        });
        await connection.save();
        console.log('[DEBUG] Secondary connection saved:', connection);
        // New: Synchronize update the secondary relationship of the two works
        const fromWorkBefore = await Work.findById(fromWork._id);
        const toWorkBefore = await Work.findById(toWork._id);
        console.log('[DEBUG] fromWork before update:', fromWorkBefore.secondaryUpstreamWorks);
        console.log('[DEBUG] toWork before update:', toWorkBefore.secondaryDownstreamWorks);
        await Promise.all([
          Work.findByIdAndUpdate(fromWork._id, {
            $addToSet: {
              secondaryUpstreamWorks: { work: toWork._id, type: submission.type }
            }
          }),
          Work.findByIdAndUpdate(toWork._id, {
            $addToSet: {
              secondaryDownstreamWorks: { work: fromWork._id, type: submission.type }
            }
          })
        ]);
        const fromWorkAfter = await Work.findById(fromWork._id);
        const toWorkAfter = await Work.findById(toWork._id);
        console.log('[DEBUG] fromWork after update:', fromWorkAfter.secondaryUpstreamWorks);
        console.log('[DEBUG] toWork after update:', toWorkAfter.secondaryDownstreamWorks);
      }
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review submission'
    });
  }
};

// Delete submission
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await ConnectionSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // If the submission has been approved, delete the related connection and work relationships
    if (submission.status === 'approved') {
      // Find the corresponding Connection
      const connection = await Connection.findOne({
        fromWork: submission.fromWork._id,
        toWork: submission.toWork._id,
        type: submission.type
      });

      if (connection) {
        // Delete the connection relationship from the two works
        await Promise.all([
          Work.findByIdAndUpdate(submission.fromWork._id, {
            $pull: {
              secondaryDownstreamWorks: { work: submission.toWork._id }
            }
          }),
          Work.findByIdAndUpdate(submission.toWork._id, {
            $pull: {
              secondaryUpstreamWorks: { work: submission.fromWork._id }
            }
          })
        ]);

        // Delete Connection
        await connection.remove();
      }
    }

    // Delete submission
    await submission.remove();

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission'
    });
  }
};

// Get submissions for a specific work
exports.getSubmissionsByWork = async (req, res) => {
  try {
    const { workId, direction } = req.query;
    
    if (!workId) {
      return res.status(400).json({
        success: false,
        message: 'Work ID is required'
      });
    }

    // Build query conditions
    const query = {
      $or: [
        { 'fromWork._id': workId },
        { 'toWork._id': workId }
      ],
      status: 'approved' // Only return approved submissions
    };

    const submissions = await ConnectionSubmission.find(query)
      .populate('createdBy', 'username')
      .sort('-createdAt');

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions by work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions'
    });
  }
}; 