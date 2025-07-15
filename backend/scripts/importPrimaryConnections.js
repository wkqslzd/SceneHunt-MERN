const mongoose = require('mongoose');
const Work = require('../models/Work');
require('dotenv').config();

const primaryConnections = [
  {
    from: { title: "The Hobbit", type: "book", year: 1937 },
    to: { title: "The Lord of the Rings", type: "book", year: 1954 },
    connectionType: "Sequel",
    direction: "primary"
  },
  {
    from: { title: "The Lord of the Rings", type: "book", year: 1954 },
    to: { title: "The Lord of the Rings: The Fellowship of the Ring", type: "screen", year: 2001 },
    connectionType: "Adaptation",
    direction: "primary"
  },
  {
    from: { title: "The Lord of the Rings: The Fellowship of the Ring", type: "screen", year: 2001 },
    to: { title: "The Lord of the Rings: The Two Towers", type: "screen", year: 2002 },
    connectionType: "Sequel",
    direction: "primary"
  },
  {
    from: { title: "The Lord of the Rings: The Two Towers", type: "screen", year: 2002 },
    to: { title: "The Lord of the Rings: The Return of the King", type: "screen", year: 2003 },
    connectionType: "Sequel",
    direction: "primary"
  },
  {
    from: { title: "The Hobbit", type: "book", year: 1937 },
    to: { title: "The Hobbit: An Unexpected Journey", type: "screen", year: 2012 },
    connectionType: "Adaptation",
    direction: "primary"
  },
  {
    from: { title: "The Hobbit: An Unexpected Journey", type: "screen", year: 2012 },
    to: { title: "The Hobbit: The Desolation of Smaug", type: "screen", year: 2013 },
    connectionType: "Sequel",
    direction: "primary"
  },
  {
    from: { title: "The Hobbit: The Desolation of Smaug", type: "screen", year: 2013 },
    to: { title: "The Hobbit: The Battle of the Five Armies", type: "screen", year: 2014 },
    connectionType: "Sequel",
    direction: "primary"
  },
  {
    from: { title: "The Hobbit: The Battle of the Five Armies", type: "screen", year: 2014 },
    to: { title: "The Lord of the Rings: The Rings of Power", type: "screen", year: 2022 },
    connectionType: "Sequel",
    direction: "primary"
  }
];

async function clearAllPrimaryConnections() {
  try {
    // Clear primaryUpstreamWorks and primaryDownstreamWorks for all works
    await Work.updateMany(
      {},
      {
        $set: {
          primaryUpstreamWorks: [],
          primaryDownstreamWorks: []
        }
      }
    );
    console.log('Successfully cleared all primary connections');
  } catch (error) {
    console.error('Error clearing primary connections:', error);
    throw error;
  }
}

async function findWorkByDetails(details) {
  const work = await Work.findOne({
    title: details.title,
    type: details.type,
    year: details.year
  });
  
  if (!work) {
    console.error(`Work not found: ${details.title} (${details.type}, ${details.year})`);
    return null;
  }
  
  return work;
}

async function importPrimaryConnections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing primary connections
    await clearAllPrimaryConnections();

    // Process each connection
    for (const connection of primaryConnections) {
      // Find both works
      const fromWork = await findWorkByDetails(connection.from);
      const toWork = await findWorkByDetails(connection.to);

      if (!fromWork || !toWork) {
        console.error('Skipping connection due to missing work(s)');
        continue;
      }

      // Update fromWork's primaryDownstreamWorks
      await Work.updateOne(
        { _id: fromWork._id },
        { 
          $addToSet: { 
            primaryDownstreamWorks: { 
              work: toWork._id, 
              type: connection.connectionType 
            } 
          } 
        }
      );

      // Update toWork's primaryUpstreamWorks
      await Work.updateOne(
        { _id: toWork._id },
        { 
          $addToSet: { 
            primaryUpstreamWorks: { 
              work: fromWork._id, 
              type: connection.connectionType 
            } 
          } 
        }
      );

      console.log(`Added connection: ${fromWork.title} -> ${toWork.title}`);
    }

    console.log('Primary connections import completed successfully');
  } catch (error) {
    console.error('Error importing primary connections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importPrimaryConnections(); 