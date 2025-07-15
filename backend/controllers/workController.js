const Work = require('../models/Work');
const Review = require('../models/Review');
const Connection = require('../models/Connection');
const ConnectionSubmission = require('../models/ConnectionSubmission');

// Create a new work
exports.createWork = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      genre,
      coverImages,
      author,
      year,
      director,
      releaseDate
    } = req.body;

    // Verify the required fields
    if (!title || !description || !type || !genre || !coverImages || coverImages.length === 0 || !year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify cover images
    if (!Array.isArray(coverImages) || coverImages.length === 0) {
      return res.status(400).json({ message: 'At least one cover image is required' });
    }

    // Verify specific fields based on work type
    if (type === 'book' && !author) {
      return res.status(400).json({ message: 'Book type requires an author' });
    }

    if (type === 'screen' && (!director || !releaseDate)) {
      return res.status(400).json({ message: 'Screen type requires a director and release date' });
    }

    const work = new Work({
      title,
      description,
      type,
      genre,
      coverImages,
      author,
      year,
      director,
      releaseDate,
      createdBy: req.user._id
    });

    await work.save();
    res.status(201).json(work);
  } catch (error) {
    console.error('Create work failed:', error);
    res.status(500).json({ message: 'Create work failed', error: error.message });
  }
};

// Get work details
exports.getWorkDetail = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('primaryUpstreamWorks.work')
      .populate('primaryDownstreamWorks.work')
      .populate('secondaryUpstreamWorks.work')
      .populate('secondaryDownstreamWorks.work');

    if (!work) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // Get top-level reviews
    const topLevelReviews = await Review.find({
      work: work._id,
      parentReview: null
    })
    .populate('user', 'username nickname avatar')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      ...work.toObject(),
      topLevelReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update work
exports.updateWork = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      genre,
      coverImages,
      author,
      year,
      director,
      releaseDate
    } = req.body;

    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // Verify cover images
    if (coverImages && (!Array.isArray(coverImages) || coverImages.length === 0)) {
      return res.status(400).json({ message: 'At least one cover image is required' });
    }

    // Update work information
    const updateData = {
      title: title || work.title,
      description: description || work.description,
      type: type || work.type,
      genre: genre || work.genre,
      coverImages: coverImages || work.coverImages,
      author: author || work.author,
      year: year || work.year,
      director: director || work.director,
      releaseDate: releaseDate || work.releaseDate
    };

    const updatedWork = await Work.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedWork);
  } catch (error) {
    console.error('Update work failed:', error);
    res.status(500).json({ message: 'Update work failed', error: error.message });
  }
};

// Search works
exports.searchWorks = async (req, res) => {
  try {
    const {
      title,
      type,
      yearMin,
      yearMax,
      genre,
      page = 1,
      limit = 10
    } = req.query;

    // Build query conditions
    const query = {};

    // Title fuzzy search
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    // Type filter
    if (type && ['book', 'screen'].includes(type)) {
      query.type = type;
    }

    // Year range filter
    if (yearMin || yearMax) {
      query.year = {};
      if (yearMin) query.year.$gte = parseInt(yearMin);
      if (yearMax) query.year.$lte = parseInt(yearMax);
    }

    // Genre filter
    if (genre) {
      const genres = genre.split(',').map(g => g.trim());
      query.genre = { $in: genres };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Direct find, no aggregation
    const [works, total] = await Promise.all([
      Work.find(query)
        .sort({ averageRating: -1, ratingCount: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Work.countDocuments(query)
    ]);

    // Return results
    res.json({
      works,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search works failed:', error);
    res.status(500).json({ message: 'Search works failed', error: error.message });
  }
};

// Get work list
exports.getWorks = async (req, res) => {
  try {
    const works = await Work.find()
      .select('title description type genre coverImages averageRating ratingCount author director year')
      .sort({ createdAt: -1 });
    
    res.json(works);
  } catch (error) {
    console.error('Get works list failed:', error);
    res.status(500).json({ message: 'Get works list failed', error: error.message });
  }
};

// Add primary connection
exports.addPrimaryConnection = async (req, res) => {
  try {
    const workId = req.params.id;
    const { targetWorkId, type, direction } = req.body;

    // Log output, troubleshoot ID and find results
    console.log('addPrimaryConnection called');
    console.log('workId:', workId, 'targetWorkId:', targetWorkId);
    const sourceWork = await Work.findById(workId);
    const targetWork = await Work.findById(targetWorkId);
    console.log('sourceWork:', sourceWork);
    console.log('targetWork:', targetWork);

    if (!sourceWork || !targetWork) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // New: Cannot connect to oneself
    if (workId === targetWorkId) {
      return res.status(400).json({ message: 'Cannot connect to oneself' });
    }

    // Verify the connection type
    if (!['Adaptation', 'Sequel'].includes(type)) {
      return res.status(400).json({ message: 'Primary connection can only be Adaptation or Sequel' });
    }

    // Verify the year relationship: upstream work must be less than or equal to downstream work
    if (direction === 'upstream') {
      // targetWork is upstream, sourceWork is downstream
      if (targetWork.year >  sourceWork.year) {
        return res.status(400).json({ message: 'The year of the upstream work must be less than or equal to the downstream work' });
      }
    } else if (direction === 'downstream') {
      // sourceWork is upstream, targetWork is downstream
      if (sourceWork.year > targetWork.year) {
        return res.status(400).json({ message: 'The year of the upstream work must be less than or equal to the downstream work' });
      }
    }

    // Check if the same connection already exists
    const existingConnection = direction === 'upstream' 
      ? sourceWork.primaryUpstreamWorks.find(c => c.work.toString() === targetWorkId)
      : sourceWork.primaryDownstreamWorks.find(c => c.work.toString() === targetWorkId);

    if (existingConnection) {
      return res.status(400).json({ message: 'This connection already exists' });
    }

    // Add connection
    const connection = {
      work: targetWorkId,
      type
    };

    if (direction === 'upstream') {
      sourceWork.primaryUpstreamWorks.push(connection);
      targetWork.primaryDownstreamWorks.push({
        work: workId,
        type
      });
    } else {
      sourceWork.primaryDownstreamWorks.push(connection);
      targetWork.primaryUpstreamWorks.push({
        work: workId,
        type
      });
    }

    await Promise.all([sourceWork.save(), targetWork.save()]);

    res.status(200).json({ message: 'Primary connection added successfully' });
  } catch (error) {
    console.error('Add primary connection failed:', error);
    res.status(500).json({ message: 'Add primary connection failed' });
  }
};

// Update primary connection
exports.updatePrimaryConnection = async (req, res) => {
  try {
    const { workId, connectionId } = req.params;
    const { type } = req.body;

    // Verify the connection type
    if (!['Adaptation', 'Sequel'].includes(type)) {
      return res.status(400).json({ message: 'Primary connection can only be Adaptation or Sequel' });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // Find and update connection
    let connection = work.primaryUpstreamWorks.id(connectionId);
    let direction = 'upstream';
    
    if (!connection) {
      connection = work.primaryDownstreamWorks.id(connectionId);
      direction = 'downstream';
    }

    if (!connection) {
      return res.status(404).json({ message: 'Connection does not exist' });
    }

    // Update connection type
    connection.type = type;
    await work.save();

    // Update the connection of the corresponding work
    const targetWork = await Work.findById(connection.work);
    if (targetWork) {
      const targetConnection = direction === 'upstream'
        ? targetWork.primaryDownstreamWorks.find(c => c.work.toString() === workId)
        : targetWork.primaryUpstreamWorks.find(c => c.work.toString() === workId);

      if (targetConnection) {
        targetConnection.type = type;
        await targetWork.save();
      }
    }

    res.status(200).json({ message: 'Primary connection updated successfully' });
  } catch (error) {
    console.error('Update primary connection failed:', error);
    res.status(500).json({ message: 'Update primary connection failed' });
  }
};

// Delete primary connection
exports.deletePrimaryConnection = async (req, res) => {
  try {
    const { id, connectionId } = req.params;
    const work = await Work.findById(id);
    
    if (!work) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // Find connection
    let connection = work.primaryUpstreamWorks.id(connectionId);
    let direction = 'upstream';
    
    if (!connection) {
      connection = work.primaryDownstreamWorks.id(connectionId);
      direction = 'downstream';
    }

    if (!connection) {
      return res.status(404).json({ message: 'Connection does not exist' });
    }

    // Delete connection
    if (direction === 'upstream') {
      work.primaryUpstreamWorks.pull(connectionId);
    } else {
      work.primaryDownstreamWorks.pull(connectionId);
    }
    await work.save();

    // Delete the connection of the corresponding work
    const targetWork = await Work.findById(connection.work);
    if (targetWork) {
      if (direction === 'upstream') {
        targetWork.primaryDownstreamWorks.pull({ work: id });
      } else {
        targetWork.primaryUpstreamWorks.pull({ work: id });
      }
      await targetWork.save();
    }

    res.status(200).json({ message: 'Primary connection deleted successfully' });
  } catch (error) {
    console.error('Delete primary connection failed:', error);
    res.status(500).json({ message: 'Delete primary connection failed' });
  }
};

// Delete work
exports.deleteWork = async (req, res) => {
  try {
    const workId = req.params.id;
    const work = await Work.findById(workId);

    if (!work) {
      return res.status(404).json({ message: 'Work does not exist' });
    }

    // 1. Delete all related comments (including replies)
    await Review.deleteMany({ workId });

    // 2. Delete all related primary connections
    // Handle upstream works
    for (const upstreamWork of work.primaryUpstreamWorks) {
      const upstreamWorkDoc = await Work.findById(upstreamWork.work);
      if (upstreamWorkDoc) {
        upstreamWorkDoc.primaryDownstreamWorks = upstreamWorkDoc.primaryDownstreamWorks.filter(
          conn => conn.work.toString() !== workId
        );
        await upstreamWorkDoc.save();
      }
    }

    // Handle downstream works
    for (const downstreamWork of work.primaryDownstreamWorks) {
      const downstreamWorkDoc = await Work.findById(downstreamWork.work);
      if (downstreamWorkDoc) {
        downstreamWorkDoc.primaryUpstreamWorks = downstreamWorkDoc.primaryUpstreamWorks.filter(
          conn => conn.work.toString() !== workId
        );
        await downstreamWorkDoc.save();
      }
    }

    // 3. Delete all related secondary connections
    // Handle upstream works
    for (const upstreamWork of work.secondaryUpstreamWorks) {
      const upstreamWorkDoc = await Work.findById(upstreamWork.work);
      if (upstreamWorkDoc) {
        upstreamWorkDoc.secondaryDownstreamWorks = upstreamWorkDoc.secondaryDownstreamWorks.filter(
          conn => conn.work.toString() !== workId
        );
        await upstreamWorkDoc.save();
      }
    }

    // Handle downstream works
    for (const downstreamWork of work.secondaryDownstreamWorks) {
      const downstreamWorkDoc = await Work.findById(downstreamWork.work);
      if (downstreamWorkDoc) {
        downstreamWorkDoc.secondaryUpstreamWorks = downstreamWorkDoc.secondaryUpstreamWorks.filter(
          conn => conn.work.toString() !== workId
        );
        await downstreamWorkDoc.save();
      }
    }

    // 4. Delete all related Connection records
    await Connection.deleteMany({
      $or: [
        { fromWork: workId },
        { toWork: workId }
      ]
    });

    // 5. Delete all related ConnectionSubmission records
    await ConnectionSubmission.deleteMany({
      $or: [
        { 'fromWork._id': workId },
        { 'toWork._id': workId }
      ]
    });

    // 6. Delete the work itself
    await work.remove();

    res.json({ message: 'The work and all related data have been successfully deleted' });
  } catch (error) {
    console.error('Delete work failed:', error);
    res.status(500).json({ message: 'Delete work failed', error: error.message });
  }
}; 