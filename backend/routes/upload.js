const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const { uploadAvatar, uploadEvidence, uploadCovers } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// set upload type middleware
const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};

// avatar upload route
router.post(
  '/avatar',
  auth,
  setUploadType('avatar'),
  upload.single('avatar'),
  handleUploadError,
  uploadAvatar
);

// evidence image upload route - source work image
router.post(
  '/evidence/from',
  auth,
  setUploadType('evidence'),
  upload.single('imageFrom'),
  handleUploadError,
  (req, res) => uploadEvidence(req, res, 'from')
);

// evidence image upload route - target work image
router.post(
  '/evidence/to',
  auth,
  setUploadType('evidence'),
  upload.single('imageTo'),
  handleUploadError,
  (req, res) => uploadEvidence(req, res, 'to')
);

// work cover image upload route
router.post(
  '/covers',
  auth,
  setUploadType('covers'),
  upload.array('covers', 5), // up to 5 images
  handleUploadError,
  uploadCovers
);

module.exports = router; 