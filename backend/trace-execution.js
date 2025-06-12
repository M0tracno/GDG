// Trace route file execution step by step

console.log('=== Detailed Route File Execution Trace ===');

// Override console.error to catch any silent errors
const originalConsoleError = console.error;
console.error = function(...args) {
  console.log('🔥 ERROR CAUGHT:', ...args);
  originalConsoleError.apply(console, args);
};

// Override process.on to catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log('🔥 UNCAUGHT EXCEPTION:', error.message);
  console.log('Stack:', error.stack);
});

try {
  console.log('1. Testing if we can manually execute the route file code...');
  
  const express = require('express');
  console.log('✓ Express imported');
  
  const parentAuthController = require('./controllers/mongodb-parentAuthController');
  console.log('✓ Parent auth controller imported');
  
  const { parentAuth } = require('./middleware/auth');
  console.log('✓ Middleware imported');
  
  console.log('2. Creating router manually...');
  const router = express.Router();
  console.log('✓ Router created:', typeof router);
  
  console.log('3. Adding routes manually...');
  router.post('/parent/send-otp', parentAuthController.sendOTP);
  console.log('✓ Added send-otp route');
  
  router.post('/parent/verify-otp', parentAuthController.verifyOTP);
  console.log('✓ Added verify-otp route');
  
  router.get('/parent/profile', parentAuth, parentAuthController.getProfile);
  console.log('✓ Added profile route');
  
  router.put('/parent/profile', parentAuth, parentAuthController.updateProfile);
  console.log('✓ Added update profile route');
  
  router.post('/parent/logout', parentAuth, parentAuthController.logout);
  console.log('✓ Added logout route');
  
  console.log('4. Manual router completed successfully!');
  console.log('Router type:', typeof router);
  console.log('Router constructor:', router.constructor.name);
  
  console.log('5. Now testing actual file import...');
  // Clear cache first
  const routePath = require.resolve('./routes/mongodb-parentAuth');
  delete require.cache[routePath];
  
  console.log('6. Importing route file...');
  const actualRoutes = require('./routes/mongodb-parentAuth');
  console.log('Actual routes result:', actualRoutes);
  console.log('Type:', typeof actualRoutes);
  
} catch (error) {
  console.error('❌ Error during trace:', error.message);
  console.error('Stack trace:', error.stack);
}
