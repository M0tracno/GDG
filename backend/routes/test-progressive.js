// Progressive dependency test route file

console.log('🔍 Starting progressive route file execution...');

try {
  console.log('Step 1: Express import...');
  const express = require('express');
  console.log('✓ Express imported');
  
  console.log('Step 2: Router creation...');
  const router = express.Router();
  console.log('✓ Router created');
  
  console.log('Step 3: Testing middleware import...');
  const { parentAuth } = require('../middleware/auth');
  console.log('✓ Middleware imported successfully');
  console.log('Middleware type:', typeof parentAuth);
  
  console.log('Step 4: Testing controller import...');
  const parentAuthController = require('../controllers/mongodb-parentAuthController');
  console.log('✓ Controller imported successfully');
  console.log('Controller type:', typeof parentAuthController);
  console.log('Controller methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(parentAuthController)));
  
  console.log('Step 5: Adding routes...');
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
  
  console.log('Step 6: Exporting router...');
  module.exports = router;
  console.log('✅ Progressive route file completed successfully');

} catch (error) {
  console.error('❌ Error in progressive route file at step:', error.message);
  console.error('Stack:', error.stack);
  
  // Export empty object on error to prevent further issues
  module.exports = {};
}
