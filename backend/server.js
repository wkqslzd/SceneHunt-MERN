const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const workRoutes = require('./routes/works');
const userRoutes = require('./routes/users');
const connectionRoutes = require('./routes/connection');
const jwt = require('jsonwebtoken');

// load environment variables
dotenv.config();

// connect to database
connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Allow all sources
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowable HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowable request headers
}));

// middleware
app.use(express.json());

// set JWT configuration
process.env.JWT_SECRET = 'your-secret-key';
process.env.JWT_EXPIRES_IN = '24h';

// routes
app.use('/api/works', workRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);

// test route
app.get('/', (req, res) => {
  res.json({ message: 'Culture platform API is running normally' });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal error of the server' });
});

const PORT = process.env.PORT || 5000; // 使用环境变量或默认端口5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
}); 