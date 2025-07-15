const path = require('path');

// Handle avatar upload
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No file uploaded'
      });
    }

    // Return image URL
    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to upload avatar'
    });
  }
};

// Handle evidence image upload
exports.uploadEvidence = async (req, res, type) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: `No ${type === 'from' ? 'source' : 'target'} work image uploaded`
      });
    }

    // Return image URL
    const imageUrl = `/uploads/evidence/${req.file.filename}`;
    res.json({ 
      imageUrl,
      type
    });
  } catch (error) {
    console.error('Evidence image upload failed:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to upload evidence image'
    });
  }
};

// Handle work cover image upload
exports.uploadCovers = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No cover images uploaded'
      });
    }

    // Return all image URLs
    const imageUrls = req.files.map(file => `/uploads/covers/${file.filename}`);
    res.json({ imageUrls });
  } catch (error) {
    console.error('Cover images upload failed:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to upload cover images'
    });
  }
}; 