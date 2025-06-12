#!/usr/bin/env node

/**
 * Pre-deployment script to validate production readiness
 * Run this before deploying to production to ensure everything is set up correctly
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const config = require('../config/config');
const { connectDB } = require('../config/mongodb');

// Load environment variables
dotenv.config();

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting pre-deployment checks...');

// Check required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV',
  'PORT'
];

// Add database-specific required variables
if (config.db.type === 'mongodb') {
  requiredEnvVars.push('MONGODB_URI');
}

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:', missingVars.join(', '));
  console.log('Please check your .env file or deployment configuration.');
  process.exit(1);
}

// Run tests
console.log('\x1b[36m%s\x1b[0m', '🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('\x1b[32m%s\x1b[0m', '✅ Tests passed');
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Tests failed. Fix the issues before deploying.');
  process.exit(1);
}

// Check for security vulnerabilities
console.log('\x1b[36m%s\x1b[0m', '🔍 Checking for security vulnerabilities...');
try {
  execSync('npm audit --production', { stdio: 'inherit' });
  console.log('\x1b[32m%s\x1b[0m', '✅ No critical vulnerabilities found');
} catch (error) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️ Security vulnerabilities detected. Consider addressing them.');
  // Don't exit, just warn - this can be made stricter if needed
}

// Check database connection based on database type
if (config.db.type === 'mongodb') {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Checking MongoDB connection...');
  try {
    // Test MongoDB connection
    const testConnection = async () => {
      try {
        await connectDB();
        console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB connection successful');
        await mongoose.disconnect();
        return true;
      } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB connection failed:', error.message);
        return false;
      }
    };
    
    if (!testConnection()) {
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB connection check failed');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
} else {
  // Check SQLite connection
  console.log('\x1b[36m%s\x1b[0m', '🔍 Checking SQLite connection...');
  
  // Ensure database directory exists for production
  if (process.env.NODE_ENV === 'production' && process.env.RENDER) {
    const dbDir = '/opt/render/project/src/data';
    try {
      if (!fs.existsSync(dbDir)) {
        console.log(`Creating database directory at ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }
    } catch (error) {
      console.warn('\x1b[33m%s\x1b[0m', `⚠️ Unable to verify database directory at ${dbDir}. This might be expected in CI environment.`);
    }
  }
}

// Check build package for frontend
if (fs.existsSync(path.join(__dirname, '..', '..', 'build'))) {
  console.log('\x1b[32m%s\x1b[0m', '✅ Frontend build exists');
} else {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️ Frontend build not found. This is OK if deploying backend only.');
}

// Check for logs directory
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  console.log('Creating logs directory');
  fs.mkdirSync(logDir, { recursive: true });
}

// Check uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory');
  fs.mkdirSync(uploadsDir, { recursive: true });
  
  // Create subdirectories
  fs.mkdirSync(path.join(uploadsDir, 'profiles'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'course-materials'), { recursive: true });
}

// Final success message
console.log('\x1b[32m%s\x1b[0m', '✅ Pre-deployment checks completed successfully!');
console.log('\x1b[36m%s\x1b[0m', `🚀 Ready to deploy in ${process.env.NODE_ENV} mode using ${config.db.type} database.`);

// In non-production environments, show some hints
if (process.env.NODE_ENV !== 'production') {
  console.log('\x1b[33m%s\x1b[0m', '\nHints for production deployment:');
  console.log('- Set NODE_ENV=production');
  console.log('- Ensure all required environment variables are set');
  console.log('- For MongoDB, check the connection string and credentials');
  console.log('- Consider using a process manager like PM2 for production');
}

// Exit successfully
process.exit(0);
