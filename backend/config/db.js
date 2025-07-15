const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/culture-platform');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB }; 