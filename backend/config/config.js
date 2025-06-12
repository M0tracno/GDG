/**
 * Application configuration
 * Centralizes all configuration values and provides validation
 */
const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables from the appropriate .env file
dotenv.config({
  path: process.env.NODE_ENV === 'test' 
    ? path.join(__dirname, '..', '.env.test')
    : path.join(__dirname, '..', '.env')
});

// Define and validate configuration
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
    // Database configuration  // CORS configuration
  cors: require('./cors'),

  db: {
    // Database type - can be 'mongodb' or 'sqlite'
    type: process.env.DB_TYPE || 'mongodb', // default to MongoDB for new production setup
    
    // MongoDB configuration
    uri: process.env.MONGODB_URI || 'mongodb+srv://M0tracno:Karan2004@cluster0.r81e4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    
    // Keep SQLite config for backward compatibility during migration
    dialect: 'sqlite',
    storage: (() => {
      if (process.env.NODE_ENV === 'production' && process.env.RENDER) {
        return path.join('/opt/render/project/src/data', 'database.sqlite');
      } else if (process.env.NODE_ENV === 'test') {
        return path.join(__dirname, '..', 'database_test.sqlite');
      }
      return path.join(__dirname, '..', 'database.sqlite');
    })(),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  
  // CORS configuration
  cors: {
    origin: [
      'https://ai-teacher-assistant-k9nre7ha-m0tracnos-projects.vercel.app',
      ...(process.env.ADDITIONAL_CORS_ORIGINS 
          ? process.env.ADDITIONAL_CORS_ORIGINS.split(',') 
          : []),
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
};

// Validate critical configuration (throw errors if not properly configured)
const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!config.jwt.secret || config.jwt.secret.length < 32) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined or not secure enough');
    }
  }
};

// Only run validation in production
if (process.env.NODE_ENV === 'production') {
  try {
    validateConfig();
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

module.exports = config;
