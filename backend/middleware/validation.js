const { body, validationResult } = require('express-validator');
const Work = require('../models/Work');

// Custom validator: check word count
const checkWordCount = (maxWords) => {
  return (value) => {
    if (!value) return true;
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount > maxWords) {
      throw new Error(`Must be less than ${maxWords} words`);
    }
    return true;
  };
};

// Validate connection submission
exports.validateConnectionSubmission = [
  // Parse workA/workB fields first
  (req, res, next) => {
    try {
      if (typeof req.body.workA === 'string') {
        req.body.workA = JSON.parse(req.body.workA);
      }
      if (typeof req.body.workB === 'string') {
        req.body.workB = JSON.parse(req.body.workB);
      }
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workA or workB format'
      });
    }
  },
  // Validate workA
  body('workA._id')
    .isMongoId()
    .withMessage('Invalid workA ID'),
  body('workA.title')
    .notEmpty()
    .withMessage('Work A title is required')
    .isString()
    .withMessage('Work A title must be a string'),
  body('workA.type')
    .isIn(['book', 'screen'])
    .withMessage('Invalid work A type'),
  body('workA.year')
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid work A year'),

  // Validate workB
  body('workB._id')
    .isMongoId()
    .withMessage('Invalid workB ID'),
  body('workB.title')
    .notEmpty()
    .withMessage('Work B title is required')
    .isString()
    .withMessage('Work B title must be a string'),
  body('workB.type')
    .isIn(['book', 'screen'])
    .withMessage('Invalid work B type'),
  body('workB.year')
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid work B year'),

  // Validate direction
  body('direction')
    .isIn([
      "Work A (current page) is the inspiration for Work B (selected).",
      "Work B (selected) is the inspiration for Work A (current page)."
    ])
    .withMessage('Invalid direction'),

  // Validate connection type
  body('type')
    .isIn([
      'Visual Homage',
      'Quote Borrowing',
      'Thematic Echo',
      'Character Inspiration',
      'Other'
    ])
    .withMessage('Invalid connection type'),

  // Validate user explanation
  body('userComment')
    .notEmpty()
    .withMessage('User comment is required')
    .isString()
    .withMessage('User comment must be a string')
    .custom(checkWordCount(100))
    .withMessage('User comment must not exceed 100 words'),

  // Validate if works exist and are not duplicates
  async (req, res, next) => {
    try {
      const [workA, workB] = await Promise.all([
        Work.findById(req.body.workA._id),
        Work.findById(req.body.workB._id)
      ]);

      if (!workA || !workB) {
        return res.status(404).json({
          success: false,
          message: 'One or both works not found'
        });
      }

      // Validate if works are not duplicates
      if (workA._id.toString() === workB._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot connect a work to itself'
        });
      }

      // Validate if work types match
      if (workA.type !== req.body.workA.type || workB.type !== req.body.workB.type) {
        return res.status(400).json({
          success: false,
          message: 'Work type mismatch'
        });
      }

      // Validate if work years match
      if (workA.year !== req.body.workA.year || workB.year !== req.body.workB.year) {
        return res.status(400).json({
          success: false,
          message: 'Work year mismatch'
        });
      }

      // Validate if upstream and downstream work years match
      const direction = req.body.direction;
      if (direction === "Work A (current page) is the inspiration for Work B (selected).") {
        // Work A is upstream, Work B is downstream
        if (workA.year > workB.year) {
          return res.status(400).json({
            success: false,
            message: 'Invalid year relationship: The inspiration work (Work A) cannot be newer than the inspired work (Work B)',
            details: {
              workA: {
                title: workA.title,
                year: workA.year
              },
              workB: {
                title: workB.title,
                year: workB.year
              }
            }
          });
        }
      } else {
        // Work B is upstream, Work A is downstream
        if (workB.year > workA.year) {
          return res.status(400).json({
            success: false,
            message: 'Invalid year relationship: The inspiration work (Work B) cannot be newer than the inspired work (Work A)',
            details: {
              workA: {
                title: workA.title,
                year: workA.year
              },
              workB: {
                title: workB.title,
                year: workB.year
              }
            }
          });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  // Handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
]; 