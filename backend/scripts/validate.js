const mongoose = require('mongoose');
const Work = require('../../models/Work');

// database configuration
const dbConfig = {
  uri: 'mongodb://localhost:27017/works_db',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

async function validateData() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('Connected to MongoDB');

    // get all works
    const works = await Work.find();
    console.log(`\nFound ${works.length} works`);

    // validate each work
    let validCount = 0;
    let invalidCount = 0;

    for (const work of works) {
      try {
        // validate required fields
        const requiredFields = ['title', 'description', 'type', 'year', 'language', 'coverImages', 'genre'];
        const missingFields = requiredFields.filter(field => !work[field]);
        
        // validate type-specific fields
        if (work.type === 'book' && !work.author) {
          missingFields.push('author');
        }
        if (work.type === 'screen' && (!work.director || !work.releaseDate)) {
          if (!work.director) missingFields.push('director');
          if (!work.releaseDate) missingFields.push('releaseDate');
        }

        // validate genres
        const validGenres = [
          'Romance', 'Drama', 'Comedy', 'Tragedy', 'Action', 'Adventure',
          'Fantasy', 'Science Fiction', 'Mystery', 'Historical', 'Horror',
          'War', 'Thriller', 'Crime', 'SliceOfLife', 'Psychological',
          'Philosophical', 'ComingOfAge', 'Political', 'Satire', 'Nature', 'Other'
        ];
        const invalidGenres = work.genre.filter(genre => !validGenres.includes(genre));

        if (missingFields.length > 0 || invalidGenres.length > 0) {
          console.log(`\nInvalid work: ${work.title}`);
          if (missingFields.length > 0) {
            console.log(`Missing required fields: ${missingFields.join(', ')}`);
          }
          if (invalidGenres.length > 0) {
            console.log(`Invalid genres: ${invalidGenres.join(', ')}`);
          }
          invalidCount++;
        } else {
          console.log(`\nValid work: ${work.title}`);
          console.log(`Type: ${work.type}`);
          console.log(`Year: ${work.year}`);
          console.log(`Genre: ${work.genre.join(', ')}`);
          if (work.type === 'Book') {
            console.log(`Author: ${work.author}`);
          } else {
            console.log(`Director: ${work.director}`);
            console.log(`Release date: ${work.releaseDate}`);
          }
          validCount++;
        }
      } catch (error) {
        console.error(`Error validating work ${work.title}:`, error.message);
        invalidCount++;
      }
    }

    console.log('\nValidation results:');
    console.log(`Total works: ${works.length}`);
    console.log(`Valid works: ${validCount}`);
    console.log(`Invalid works: ${invalidCount}`);

  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Carry out verification
if (require.main === module) {
  validateData();
}

module.exports = validateData; 