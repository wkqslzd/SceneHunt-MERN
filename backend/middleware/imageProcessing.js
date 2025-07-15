const sharp = require('sharp');
const multer = require('multer');
const path = require('path');

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
    files: 2 // Limit to 2 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Process images middleware
const processImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.workAImage || !req.files.workBImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both workA and workB images are required' 
      });
    }

    // Process workA image
    const workAImage = await sharp(req.files.workAImage[0].buffer)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const workAThumbnail = await sharp(req.files.workAImage[0].buffer)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 60 })
      .toBuffer();

    // Process workB image
    const workBImage = await sharp(req.files.workBImage[0].buffer)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const workBThumbnail = await sharp(req.files.workBImage[0].buffer)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 60 })
      .toBuffer();
    
    // Add processed images to request object
    req.processedImages = {
      workA: {
        original: workAImage,
        thumbnail: workAThumbnail
      },
      workB: {
        original: workBImage,
        thumbnail: workBThumbnail
      }
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  processImages
}; 