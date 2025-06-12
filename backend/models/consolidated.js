// Consolidated models loader that handles both MongoDB and SQLite
const config = require('../config/config');

// Determine which database models to use
const models = config.db.type === 'mongodb' 
  ? require('./mongodb-models')
  : require('./index');

module.exports = models;
