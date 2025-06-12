// Test script to check if route files can be imported without errors

console.log('Testing route imports...');

try {
  console.log('1. Testing parentAuth routes...');
  const parentAuthRoutes = require('./routes/mongodb-parentAuth');
  console.log('✓ parentAuth routes imported successfully:', typeof parentAuthRoutes);
  
  console.log('2. Testing parentDashboard routes...');
  const parentDashboardRoutes = require('./routes/mongodb-parentDashboard');
  console.log('✓ parentDashboard routes imported successfully:', typeof parentDashboardRoutes);
  
  console.log('3. Testing controllers...');
  const parentAuthController = require('./controllers/mongodb-parentAuthController');
  console.log('✓ parentAuth controller imported successfully:', typeof parentAuthController);
  
  const parentDashboardController = require('./controllers/mongodb-parentDashboardController');
  console.log('✓ parentDashboard controller imported successfully:', typeof parentDashboardController);
  
  console.log('4. Testing middleware...');
  const { parentAuth } = require('./middleware/auth');
  console.log('✓ parentAuth middleware imported successfully:', typeof parentAuth);
  
  console.log('\n✅ All imports successful!');
  
} catch (error) {
  console.error('❌ Error during import:', error.message);
  console.error('Stack trace:', error.stack);
}
