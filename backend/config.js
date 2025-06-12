// Configuration settings for the application
require('dotenv').config();

module.exports = {
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
  jwtExpiration: '7d', // 7 days
  
  // Database configuration
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/school-management',
  
  // Server configuration
  port: process.env.PORT || 5000,
  
  // Other application settings
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  maxFileSize: 5 * 1024 * 1024 // 5MB
}; 