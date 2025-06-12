// Test new route files

console.log('=== Testing New Route Files ===');

try {
  console.log('1. Testing new parentAuth routes...');
  const parentAuthRoutes = require('./routes/mongodb-parentAuth-new');
  console.log('✓ New parentAuth routes imported successfully');
  console.log('Type:', typeof parentAuthRoutes);
  console.log('Constructor:', parentAuthRoutes.constructor.name);
  
  console.log('\n2. Testing new parentDashboard routes...');
  const parentDashboardRoutes = require('./routes/mongodb-parentDashboard-new');
  console.log('✓ New parentDashboard routes imported successfully');
  console.log('Type:', typeof parentDashboardRoutes);
  console.log('Constructor:', parentDashboardRoutes.constructor.name);
  
  console.log('\n3. Testing if new routes can be used with express...');
  const express = require('express');
  const testApp = express();
  testApp.use('/api/auth', parentAuthRoutes);
  testApp.use('/api/parents', parentDashboardRoutes);
  console.log('✅ New routes can be used with express successfully!');
  
} catch (error) {
  console.error('❌ Error testing new routes:', error.message);
  console.error('Stack trace:', error.stack);
}
