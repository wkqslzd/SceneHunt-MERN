const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testUsers = {
  admins: [
    {
      username: 'Cicie44',
      password: 'Cicie44@A123',
      nickname: 'Cicie',
      role: 'admin',
      gender: 'female',
      birthDate: new Date('1990-01-01')
    },
    {
      username: 'Sirui33333',
      password: 'Sirui33333@A123',
      nickname: 'Sirui',
      role: 'admin',
      gender: 'male',
      birthDate: new Date('1991-02-02')
    },
    {
      username: 'Jnnnnnnya',
      password: 'Jnnnnnnya@A123',
      nickname: 'Janya',
      role: 'admin',
      gender: 'female',
      birthDate: new Date('1992-03-03')
    },
    {
      username: 'patrickstar123456789',
      password: 'patrickstar123456789@A123',
      nickname: 'Patrick',
      role: 'admin',
      gender: 'male',
      birthDate: new Date('1993-04-04')
    },
    {
      username: 'YizheWang3',
      password: 'YizheWang3@A123',
      nickname: 'Yizhe',
      role: 'admin',
      gender: 'male',
      birthDate: new Date('1994-05-05')
    },
    {
      username: 'wkqslzd',
      password: 'wkqslzd@A123',
      nickname: 'WK',
      role: 'admin',
      gender: 'male',
      birthDate: new Date('1995-06-06')
    }
  ],
  users: [
    {
      username: 'smitty23',
      password: 'Pa$$w0rd!',
      nickname: 'Smitty',
      role: 'user',
      gender: 'male',
      birthDate: new Date('1995-03-20')
    },
    {
      username: 'maxiscool',
      password: 'CoolMax123!',
      nickname: 'Max',
      role: 'user',
      gender: 'male',
      birthDate: new Date('1993-07-10')
    },
    {
      username: 'jennywren',
      password: 'Jenny@123',
      nickname: 'Jenny',
      role: 'user',
      gender: 'female',
      birthDate: new Date('1994-11-25')
    }
  ]
};

async function initTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // create admin accounts
    for (const admin of testUsers.admins) {
      const existingAdmin = await User.findOne({ username: admin.username });
      if (!existingAdmin) {
        const newAdmin = new User(admin);
        await newAdmin.save();
        console.log(`Created admin: ${admin.username}`);
      } else {
        console.log(`Admin already exists: ${admin.username}`);
      }
    }

    // create regular user accounts
    for (const user of testUsers.users) {
      const existingUser = await User.findOne({ username: user.username });
      if (!existingUser) {
        const newUser = new User(user);
        await newUser.save();
        console.log(`Created user: ${user.username}`);
      } else {
        console.log(`User already exists: ${user.username}`);
      }
    }

    console.log('\nTest data initialization completed!');
    console.log('\nAdmin accounts:');
    testUsers.admins.forEach(admin => {
      console.log(`Username: ${admin.username} / Password: ${admin.password}`);
    });
    
    console.log('\nRegular user accounts:');
    testUsers.users.forEach(user => {
      console.log(`Username: ${user.username} / Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error initializing test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initTestData(); 