const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const net = require('net');

require('dotenv').config();

// create Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'combined.log') 
    })
  ]
});

// add console output in development environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// use Morgan in development environment
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// static file service
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/backend/images', express.static(path.join(__dirname, 'images')));

// add image request debugging middleware
app.use('/backend/images', (req, res, next) => {
  console.log('Image request:', req.path);
  next();
});

// routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const worksRoutes = require('./routes/works');
const connectionRoutes = require('./routes/connection');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const likeRoutes = require('./routes/like');
const connectionSubmissionRoutes = require('./routes/connectionSubmission');

// use routes
// public routes (no authentication)
app.use('/api/works', worksRoutes);

// routes that require authentication
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/connection-submissions', connectionSubmissionRoutes);

// add debugging logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    error: err.status === 500 ? 'Internal Server Error' : err.message,
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// check if port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// get available port
async function getAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

// database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('Connected to MongoDB');
    
    // get available port
    const port = await getAvailablePort(process.env.PORT || 5000);
    
    // if port is not default 5000, log it
    if (port !== 5000) {
      logger.info(`Port 5000 is in use, switching to port ${port}`);
      // write actual used port to file
      const fs = require('fs');
      fs.writeFileSync(path.join(__dirname, 'port.txt'), port.toString());
    }
    
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app; 