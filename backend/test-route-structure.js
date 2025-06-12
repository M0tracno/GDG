// Test script to check route structure

console.log('Testing route structure...');

try {
  const express = require('express');
  
  console.log('1. Testing parentAuth routes structure...');
  const parentAuthRoutes = require('./routes/mongodb-parentAuth');
  console.log('parentAuth type:', typeof parentAuthRoutes);
  console.log('parentAuth constructor:', parentAuthRoutes.constructor.name);
  console.log('Is Express Router?:', parentAuthRoutes instanceof express.Router);
  
  console.log('\n2. Testing parentDashboard routes structure...');
  const parentDashboardRoutes = require('./routes/mongodb-parentDashboard');
  console.log('parentDashboard type:', typeof parentDashboardRoutes);
  console.log('parentDashboard constructor:', parentDashboardRoutes.constructor.name);
  console.log('Is Express Router?:', parentDashboardRoutes instanceof express.Router);
  
  console.log('\n3. Testing if routes can be used with express...');
  const testApp = express();
  testApp.use('/api/auth', parentAuthRoutes);
  testApp.use('/api/parents', parentDashboardRoutes);
  console.log('✅ Routes can be used with express!');
  
} catch (error) {
  console.error('❌ Error during route structure test:', error.message);
  console.error('Stack trace:', error.stack);
}
