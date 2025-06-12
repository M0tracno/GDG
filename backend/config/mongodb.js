const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

/**
 * MongoDB connection setup
 * Establishes connection to MongoDB using environment variables
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      // In production, database connection failure is critical
      process.exit(1);
    }
    return false;
  }
};

module.exports = { connectDB };
