// Debug controller methods

console.log('=== Debugging Controller Methods ===');

try {
  console.log('1. Importing parentAuthController...');
  const parentAuthController = require('./controllers/mongodb-parentAuthController');
  
  console.log('2. Controller type:', typeof parentAuthController);
  console.log('3. Controller keys:', Object.keys(parentAuthController));
  console.log('4. Controller methods:');
  
  Object.keys(parentAuthController).forEach(key => {
    console.log(`   - ${key}: ${typeof parentAuthController[key]}`);
  });
  
  console.log('\n5. Testing specific methods:');
  console.log('   - sendOTP:', typeof parentAuthController.sendOTP);
  console.log('   - verifyOTP:', typeof parentAuthController.verifyOTP);
  console.log('   - getProfile:', typeof parentAuthController.getProfile);
  console.log('   - updateProfile:', typeof parentAuthController.updateProfile);
  console.log('   - logout:', typeof parentAuthController.logout);
  
  console.log('\n6. Importing parentDashboardController...');
  const parentDashboardController = require('./controllers/mongodb-parentDashboardController');
  
  console.log('7. Dashboard controller type:', typeof parentDashboardController);
  console.log('8. Dashboard controller keys:', Object.keys(parentDashboardController));
  
} catch (error) {
  console.error('❌ Error during controller debug:', error.message);
  console.error('Stack trace:', error.stack);
}
