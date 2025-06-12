// Detailed debug script to trace route execution

console.log('=== Detailed Route Execution Debug ===');

try {
  console.log('1. Testing MongoDB models import...');
  const models = require('./models/mongodb-models');
  console.log('✓ MongoDB models imported successfully');
  console.log('Available models:', Object.keys(models));
  
  console.log('\n2. Testing controllers import...');
  const parentAuthController = require('./controllers/mongodb-parentAuthController');
  console.log('✓ Parent auth controller imported');
  
  const parentDashboardController = require('./controllers/mongodb-parentDashboardController');
  console.log('✓ Parent dashboard controller imported');
  
  console.log('\n3. Testing middleware import...');
  const auth = require('./middleware/auth');
  console.log('✓ Auth middleware imported');
  console.log('Available middleware:', Object.keys(auth));
  
  console.log('\n4. Testing Express import...');
  const express = require('express');
  console.log('✓ Express imported');
  
  console.log('\n5. Testing Express Router creation...');
  const router = express.Router();
  console.log('✓ Router created:', router.constructor.name);
  
  console.log('\n6. Now executing parentAuth route file manually...');
  
  // Manually execute the route file content
  console.log('Creating router for parentAuth...');
  const authRouter = express.Router();
  
  console.log('Adding routes to authRouter...');
  authRouter.post('/parent/send-otp', parentAuthController.sendOTP);
  authRouter.post('/parent/verify-otp', parentAuthController.verifyOTP);
  authRouter.get('/parent/profile', auth.parentAuth, parentAuthController.getProfile);
  authRouter.put('/parent/profile', auth.parentAuth, parentAuthController.updateProfile);
  authRouter.post('/parent/logout', auth.parentAuth, parentAuthController.logout);
  
  console.log('✓ Manual router creation successful!');
  console.log('Router type:', typeof authRouter);
  console.log('Router constructor:', authRouter.constructor.name);
  
  console.log('\n7. Testing route file import one more time...');
  delete require.cache[require.resolve('./routes/mongodb-parentAuth')];
  const routeFile = require('./routes/mongodb-parentAuth');
  console.log('Route file result:', routeFile);
  console.log('Type:', typeof routeFile);
  
} catch (error) {
  console.error('❌ Error during detailed debug:', error.message);
  console.error('Stack trace:', error.stack);
}
