const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/culture-platform';

async function createSuperAdmin() {
  await mongoose.connect(MONGO_URI);

  const username = 'superadminSceneHunt';
  const password = 'initial_password123';
  const nickname = 'SuperAdmin';
  const role = 'super_admin';

  // Check if it already exists
  const exist = await User.findOne({ username });
  if (exist) {
    console.log('Super admin already exists.');
    process.exit(0);
  }

  const user = new User({
    username,
    password,
    avatar: 'default-avatar.png',
    nickname,
    gender: 'male',
    birthDate: new Date('1990-01-01'),
    bio: '',
    role,
    ratingCount: 0,
    connectionCount: 0,
    postHistory: { approved: [], rejected: [], pending: [] }
  });

  await user.save();
  console.log('Super admin created successfully!');
  process.exit(0);
}

// Execute initialization
createSuperAdmin(); 