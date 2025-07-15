const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Work = require('../models/Work');

// database configuration
const dbConfig = {
  uri: 'mongodb://localhost:27017/culture-platform',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

async function importData() {
  try {
    // use the main project's database connection
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('Connected to MongoDB');

    // clear all works, avoid duplicates
    await Work.deleteMany({});
    console.log('All works cleared.');

    // read all JSON files
    const dataDir = path.join(__dirname, 'data');
    const bookFiles = await fs.readdir(path.join(dataDir, 'books'));
    const screenFiles = await fs.readdir(path.join(dataDir, 'screens'));

    // read and import book data
    const bookPromises = bookFiles.map(async (file) => {
      try {
        const content = await fs.readFile(path.join(dataDir, 'books', file), 'utf-8');
        const data = JSON.parse(content);
        // unique: title-type-year
        const exist = await Work.findOne({ title: data.title, type: 'book', year: data.year });
        if (exist) {
          console.log(`Skipped duplicate book: ${data.title}`);
          return;
        }
        const work = new Work({
          ...data,
          type: 'book'
        });
        await work.save();
        console.log(`Imported book: ${data.title}`);
      } catch (error) {
        console.error(`Error importing book ${file}:`, error.message);
      }
    });

    // read and import film data
    const screenPromises = screenFiles.map(async (file) => {
      try {
        const content = await fs.readFile(path.join(dataDir, 'screens', file), 'utf-8');
        const data = JSON.parse(content);
        // unique: title-type-year
        const exist = await Work.findOne({ title: data.title, type: 'screen', year: data.year });
        if (exist) {
          console.log(`Skipped duplicate screen: ${data.title}`);
          return;
        }
        const work = new Work({
          ...data,
          type: 'screen'
        });
        await work.save();
        console.log(`Imported screen: ${data.title}`);
      } catch (error) {
        console.error(`Error importing screen ${file}:`, error.message);
      }
    });

    // wait for all imports to complete
    await Promise.all([...bookPromises, ...screenPromises]);
    console.log('Data import completed successfully');

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// execute import
if (require.main === module) {
  importData();
}

module.exports = importData; 