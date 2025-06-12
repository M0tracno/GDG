const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('../utils/logger');

// Create Sequelize instance using centralized configuration
const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: config.db.logging,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000
  },
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    if (process.env.NODE_ENV === 'production') {
      // In production, database connection failure is critical
      process.exit(1);
    }
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
}; 