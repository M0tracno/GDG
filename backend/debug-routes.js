// Debug what route files are actually exporting

console.log('Debugging route exports...');

try {
  // Test importing express first
  const express = require('express');
  console.log('Express imported successfully');
  
  // Test creating a router directly
  const testRouter = express.Router();
  console.log('Test router created:', testRouter.constructor.name);
  
  console.log('\n--- Testing parentAuth route step by step ---');
  
  // Import the parent auth controller
  console.log('1. Importing parent auth controller...');
  const parentAuthController = require('./controllers/mongodb-parentAuthController');
  console.log('✓ Controller imported:', typeof parentAuthController);
  
  // Import middleware
  console.log('2. Importing middleware...');
  const { parentAuth } = require('./middleware/auth');
  console.log('✓ Middleware imported:', typeof parentAuth);
  
  // Now try to import the route file
  console.log('3. Importing route file...');
  const parentAuthRoutes = require('./routes/mongodb-parentAuth');
  console.log('Route file exported:', parentAuthRoutes);
  console.log('Route type:', typeof parentAuthRoutes);
  console.log('Route constructor:', parentAuthRoutes.constructor.name);
  
  if (parentAuthRoutes && typeof parentAuthRoutes.stack !== 'undefined') {
    console.log('✓ Route has stack (Express Router)');
  } else {
    console.log('❌ Route does not have stack property');
  }
  
} catch (error) {
  console.error('❌ Error during debug:', error.message);
  console.error('Stack trace:', error.stack);
}
