const mongoose = require('mongoose');
const Work = require('../models/Work');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/db');
const { reviewConnection } = require('../controllers/connectionController');

jest.setTimeout(30000); // set timeout to 30 seconds

describe('Connection Approval Bidirectional Symmetry Tests', () => {
  let workA;
  let workB;
  let connection;
  let adminUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // clear database
    await Work.deleteMany({});
    await Connection.deleteMany({});
    await User.deleteMany({});

    // create test user
    adminUser = await User.create({
      username: 'admin',
      userID: 'admin123',
      password: 'password123',
      nickname: 'Admin',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      role: 'admin'
    });

    // create test works
    workA = await Work.create({
      title: 'Inception',
      description: 'A mind-bending movie',
      type: 'Screen',
      genre: ['Science Fiction'],
      language: 'English',
      coverImage: 'inception.jpg',
      director: 'Christopher Nolan',
      releaseDate: new Date('2010-07-16')
    });

    workB = await Work.create({
      title: 'Paprika',
      description: 'A Japanese animated film',
      type: 'Screen',
      genre: ['Animation', 'Science Fiction'],
      language: 'Japanese',
      coverImage: 'paprika.jpg',
      director: 'Satoshi Kon',
      releaseDate: new Date('2006-11-25')
    });

    // create pending connection
    connection = await Connection.create({
      type: 'Thematic Echo',
      connectionLevel: 'secondary',
      fromWork: workA._id,
      toWork: workB._id,
      imagesFrom: ['image1.jpg'],
      imagesTo: ['image2.jpg'],
      userComment: 'Both movies explore the theme of dreams and reality',
      createdBy: adminUser._id,
      status: 'pending'
    });
  });

  test('should correctly implement bidirectional symmetry when approving a connection', async () => {
    const req = {
      params: { id: connection._id },
      body: { decision: 'approved', reviewComment: 'Connection is valid' },
      user: adminUser
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await reviewConnection(req, res);

    // get updated works
    const updatedWorkA = await Work.findById(workA._id);
    const updatedWorkB = await Work.findById(workB._id);

    // validate WorkA's downstreamWorks
    expect(updatedWorkA.downstreamWorks).toHaveLength(1);
    expect(updatedWorkA.downstreamWorks[0].work.toString()).toBe(workB._id.toString());
    expect(updatedWorkA.downstreamWorks[0].type).toBe('Thematic Echo');

    // validate WorkB's upstreamWorks
    expect(updatedWorkB.upstreamWorks).toHaveLength(1);
    expect(updatedWorkB.upstreamWorks[0].work.toString()).toBe(workA._id.toString());
    expect(updatedWorkB.upstreamWorks[0].type).toBe('Thematic Echo');
  });

  test('should prevent duplicate work-type pairs when re-approving the same connection', async () => {
    const req = {
      params: { id: connection._id },
      body: { decision: 'approved', reviewComment: 'Connection is valid' },
      user: adminUser
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // first approval
    await reviewConnection(req, res);

    // get first updated works
    const firstUpdateWorkA = await Work.findById(workA._id);
    const firstUpdateWorkB = await Work.findById(workB._id);

    // second approval
    await reviewConnection(req, res);

    // get second updated works
    const secondUpdateWorkA = await Work.findById(workA._id);
    const secondUpdateWorkB = await Work.findById(workB._id);

    // validate no duplicate addition
    expect(secondUpdateWorkA.downstreamWorks).toHaveLength(1);
    expect(secondUpdateWorkB.upstreamWorks).toHaveLength(1);
    expect(secondUpdateWorkA.downstreamWorks).toEqual(firstUpdateWorkA.downstreamWorks);
    expect(secondUpdateWorkB.upstreamWorks).toEqual(firstUpdateWorkB.upstreamWorks);
  });

  test('should maintain transaction integrity when updating both works', async () => {
    const invalidWorkId = new mongoose.Types.ObjectId();
    connection.fromWork = invalidWorkId;
    await connection.save();

    const req = {
      params: { id: connection._id },
      body: { decision: 'approved', reviewComment: 'Test transaction' },
      user: adminUser
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await reviewConnection(req, res);

    // validate no update
    const finalWorkA = await Work.findById(workA._id);
    const finalWorkB = await Work.findById(workB._id);

    expect(finalWorkA.downstreamWorks).toHaveLength(0);
    expect(finalWorkB.upstreamWorks).toHaveLength(0);
  });
});

describe('Specific Connection Type Tests', () => {
  let workA;
  let workB;
  let connection;
  let adminUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // clear database
    await Work.deleteMany({});
    await Connection.deleteMany({});
    await User.deleteMany({});

    // create test user
    adminUser = await User.create({
      username: 'admin',
      userID: 'admin123',
      password: 'password123',
      nickname: 'Admin',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      role: 'admin'
    });

    // create test works
    workA = await Work.create({
      title: 'Anyone But You',
      description: 'A romantic comedy',
      type: 'Screen',
      genre: ['Romance', 'Comedy'],
      language: 'English',
      coverImage: 'anyone-but-you.jpg',
      director: 'Will Gluck',
      releaseDate: new Date('2023-12-22')
    });

    workB = await Work.create({
      title: 'Titanic',
      description: 'A romantic drama',
      type: 'Screen',
      genre: ['Romance', 'Drama'],
      language: 'English',
      coverImage: 'titanic.jpg',
      director: 'James Cameron',
      releaseDate: new Date('1997-12-19')
    });

    // create pending connection
    connection = await Connection.create({
      type: 'Visual Homage',
      connectionLevel: 'secondary',
      fromWork: workA._id,
      toWork: workB._id,
      imagesFrom: ['image1.jpg'],
      imagesTo: ['image2.jpg'],
      userComment: 'Scene homage',
      createdBy: adminUser._id,
      status: 'pending'
    });
  });

  test('should correctly implement bidirectional update for Visual Homage connection', async () => {
    const req = {
      params: { id: connection._id },
      body: { decision: 'approved', reviewComment: 'Connection is valid' },
      user: adminUser
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await reviewConnection(req, res);

    // get updated works
    const updatedWorkA = await Work.findById(workA._id);
    const updatedWorkB = await Work.findById(workB._id);

    // validate WorkA's downstreamWorks
    expect(updatedWorkA.downstreamWorks).toHaveLength(1);
    expect(updatedWorkA.downstreamWorks[0].work.toString()).toBe(workB._id.toString());
    expect(updatedWorkA.downstreamWorks[0].type).toBe('Visual Homage');

    // validate WorkB's upstreamWorks
    expect(updatedWorkB.upstreamWorks).toHaveLength(1);
    expect(updatedWorkB.upstreamWorks[0].work.toString()).toBe(workA._id.toString());
    expect(updatedWorkB.upstreamWorks[0].type).toBe('Visual Homage');
  });
});

describe('Primary vs Secondary Connection Constraints', () => {
  let workA;
  let workB;
  let adminUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // clear database
    await Work.deleteMany({});
    await Connection.deleteMany({});
    await User.deleteMany({});

    // create test user
    adminUser = await User.create({
      username: 'admin',
      userID: 'admin123',
      password: 'password123',
      nickname: 'Admin',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      role: 'admin'
    });

    // create test works
    workA = await Work.create({
      title: 'Anyone But You',
      description: 'A romantic comedy',
      type: 'Screen',
      genre: ['Romance', 'Comedy'],
      language: 'English',
      coverImage: 'anyone-but-you.jpg',
      director: 'Will Gluck',
      releaseDate: new Date('2023-12-22')
    });

    workB = await Work.create({
      title: 'Titanic',
      description: 'A romantic drama',
      type: 'Screen',
      genre: ['Romance', 'Drama'],
      language: 'English',
      coverImage: 'titanic.jpg',
      director: 'James Cameron',
      releaseDate: new Date('1997-12-19')
    });
  });

  test('should prevent secondary connection when primary connection exists', async () => {
    // 1. create and approve a primary connection (Adaptation)
    const primaryConnection = await Connection.create({
      type: 'Adaptation',
      connectionLevel: 'primary',
      fromWork: workA._id,
      toWork: workB._id,
      imagesFrom: ['image1.jpg'],
      imagesTo: ['image2.jpg'],
      userComment: 'Adapted from Titanic',
      createdBy: adminUser._id,
      status: 'pending'
    });

    // approve primary connection
    const req1 = {
      params: { id: primaryConnection._id },
      body: { decision: 'approved', reviewComment: 'Primary connection is valid' },
      user: adminUser
    };
    const res1 = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await reviewConnection(req1, res1);

    // 2. try to create secondary connection (Visual Homage)
    const secondaryConnection = await Connection.create({
      type: 'Visual Homage',
      connectionLevel: 'secondary',
      fromWork: workA._id,
      toWork: workB._id,
      imagesFrom: ['sceneA.png'],
      imagesTo: ['sceneB.png'],
      userComment: 'The beach running scene echoes Titanic\'s deck scene.',
      createdBy: adminUser._id,
      status: 'pending'
    });

    // try to approve secondary connection
    const req2 = {
      params: { id: secondaryConnection._id },
      body: { decision: 'approved', reviewComment: 'Secondary connection is valid' },
      user: adminUser
    };
    const res2 = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await reviewConnection(req2, res2);

    // validate secondary connection is rejected
    const updatedSecondaryConnection = await Connection.findById(secondaryConnection._id);
    expect(updatedSecondaryConnection.status).toBe('rejected');
    expect(updatedSecondaryConnection.adminReview.decision).toBe('rejected');
    expect(updatedSecondaryConnection.adminReview.reviewComment).toContain('Primary connection already exists');

    // validate work relationships are not updated
    const updatedWorkA = await Work.findById(workA._id);
    const updatedWorkB = await Work.findById(workB._id);

    // validate only primary connection is recorded
    expect(updatedWorkA.downstreamWorks).toHaveLength(1);
    expect(updatedWorkA.downstreamWorks[0].type).toBe('Adaptation');
    expect(updatedWorkB.upstreamWorks).toHaveLength(1);
    expect(updatedWorkB.upstreamWorks[0].type).toBe('Adaptation');
  });
}); 