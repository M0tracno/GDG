// check-mongodb-connection.js
const mongoose = require('mongoose');
const { connectDB } = require('./config/mongodb');
const config = require('./config/config');
const logger = require('./utils/logger');

async function testMongoDBConnection() {
  try {
    // Log the URI we're trying to connect to (hiding credentials)
    const uriParts = config.db.uri.split('@');
    const maskedUri = uriParts.length > 1 
      ? `mongodb+srv://****:****@${uriParts[1]}` 
      : 'URI not properly formatted';
    
    logger.info(`Attempting to connect to MongoDB: ${maskedUri}`);

    // Try to connect
    await connectDB();
    
    // Check database connection
    const databaseState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      4: 'invalid'
    };

    if (databaseState === 1) {
      logger.info(`Successfully connected to MongoDB Atlas!`);
      logger.info(`Connected to database: ${mongoose.connection.name}`);
      logger.info(`MongoDB host: ${mongoose.connection.host}`);
    } else {
      logger.error(`MongoDB connection state: ${stateMap[databaseState] || 'unknown'}`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    return databaseState === 1;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    if (error.name === 'MongoParseError') {
      logger.error('There might be an issue with the connection string format');
    } else if (error.name === 'MongoNetworkError') {
      logger.error('Network issue detected. Check internet connection and firewall settings');
    } else if (error.name === 'MongoServerSelectionError') {
      logger.error('Could not connect to any servers in the MongoDB Atlas cluster');
    }
    return false;
  }
}

// Execute the test
testMongoDBConnection()
  .then(isConnected => {
    if (isConnected) {
      console.log('✅ MongoDB Atlas connection test PASSED');
    } else {
      console.log('❌ MongoDB Atlas connection test FAILED');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  });
