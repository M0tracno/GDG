// Test if the fixed route files work

console.log('=== Testing Fixed Route Files ===');

try {
  console.log('1. Clearing require cache...');
  Object.keys(require.cache).forEach(key => {
    if (key.includes('mongodb-parent')) {
      delete require.cache[key];
    }
  });
  
  console.log('2. Testing parentAuth routes...');
  const parentAuthRoutes = require('./routes/mongodb-parentAuth');
  console.log('✓ parentAuth imported');
  console.log('Type:', typeof parentAuthRoutes);
  console.log('Constructor:', parentAuthRoutes.constructor.name);
  
  console.log('3. Testing parentDashboard routes...');
  const parentDashboardRoutes = require('./routes/mongodb-parentDashboard');
  console.log('✓ parentDashboard imported');
  console.log('Type:', typeof parentDashboardRoutes);
  console.log('Constructor:', parentDashboardRoutes.constructor.name);
  
  console.log('4. Testing Express usage...');
  const express = require('express');
  const testApp = express();
  testApp.use('/api/auth', parentAuthRoutes);
  testApp.use('/api/parents', parentDashboardRoutes);
  console.log('✅ Fixed routes work with Express!');
  
} catch (error) {
  console.error('❌ Error testing fixed routes:', error.message);
  console.error('Stack trace:', error.stack);
}
