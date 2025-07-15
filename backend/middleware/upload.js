const multer = require('multer');
const path = require('path');

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only jpg, jpeg, png, and webp formats are allowed.'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Select different directories based on different upload types
    if (req.uploadType === 'avatar') {
      uploadPath += 'avatars/';
    } else if (req.uploadType === 'evidence') {
      uploadPath += 'evidence/';
    } else if (req.uploadType === 'covers') {
      uploadPath += 'covers/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique file name: timestamp + random number + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({ 
          error: 'Payload Too Large',
          message: 'File size exceeds the 5MB limit'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Too many files uploaded'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({ 
          error: 'Bad Request',
          message: err.message
        });
    }
  }
  
  if (err) {
    // Handle file type errors
    if (err.message.includes('Invalid file format')) {
      return res.status(415).json({ 
        error: 'Unsupported Media Type',
        message: err.message
      });
    }
    
    // Handle other errors
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'An error occurred while uploading the file'
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError
}; 