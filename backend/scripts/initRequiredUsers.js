const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/culture-platform';

// define the admin accounts to be created
const adminAccounts = [
  { username: 'Cicie44', password: 'Cicie44@A123', nickname: 'Cicie' },
  { username: 'Sirui33333', password: 'Sirui33333@A123', nickname: 'Sirui' },
  { username: 'Jnnnnnnya', password: 'Jnnnnnnya@A123', nickname: 'Jn' },
  { username: 'patrickstar123456789', password: 'patrickstar123456789@A123', nickname: 'Patrick' },
  { username: 'YizheWang3', password: 'YizheWang3@A123', nickname: 'Yizhe' },
  { username: 'wkqslzd', password: 'wkqslzd@A123', nickname: 'WKQ' },
];

// define the regular user accounts to be created
const userAccounts = [
  { username: 'smitty23', password: 'Pa$$w0rd!', nickname: 'Smitty' },
  { username: 'maxiscool', password: 'CoolMax123!', nickname: 'Max' },
  { username: 'jennywren', password: 'Jenny@123', nickname: 'Jenny' },
];

async function createUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // create admin accounts
    for (const admin of adminAccounts) {
      const exists = await User.findOne({ username: admin.username });
      
      if (!exists) {
        const user = new User({
          username: admin.username,
          password: admin.password,
          nickname: admin.nickname,
          gender: 'prefer not to say',
          birthDate: new Date('1990-01-01'),
          role: 'admin',
          avatar: 'default-avatar.png',
          bio: `${admin.nickname}'s profile`,
          ratingCount: 0,
          connectionCount: 0,
          postHistory: { approved: [], rejected: [], pending: [] }
        });
        
        await user.save();
        console.log(`Admin user ${admin.username} created successfully!`);
      } else {
        console.log(`Admin user ${admin.username} already exists.`);
      }
    }

    // create regular user accounts
    for (const regularUser of userAccounts) {
      const exists = await User.findOne({ username: regularUser.username });
      
      if (!exists) {
        const user = new User({
          username: regularUser.username,
          password: regularUser.password,
          nickname: regularUser.nickname,
          gender: 'prefer not to say',
          birthDate: new Date('1995-01-01'),
          role: 'user',
          avatar: 'default-avatar.png',
          bio: `${regularUser.nickname}'s profile`,
          ratingCount: 0,
          connectionCount: 0,
          postHistory: { approved: [], rejected: [], pending: [] }
        });
        
        await user.save();
        console.log(`Regular user ${regularUser.username} created successfully!`);
      } else {
        console.log(`Regular user ${regularUser.username} already exists.`);
      }
    }

    console.log('All required users created successfully!');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// execute initialization
createUsers(); 