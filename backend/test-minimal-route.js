// Test minimal route import

console.log('=== Testing Minimal Route Import ===');

try {
  console.log('1. Importing minimal route...');
  const minimalRoute = require('./routes/test-minimal');
  console.log('✓ Minimal route imported');
  console.log('Type:', typeof minimalRoute);
  console.log('Constructor:', minimalRoute.constructor.name);
  
  if (typeof minimalRoute === 'function') {
    console.log('✅ Minimal route is a function (Express Router)');
  } else {
    console.log('❌ Minimal route is not a function:', minimalRoute);
  }
  
} catch (error) {
  console.error('❌ Error testing minimal route:', error.message);
  console.error('Stack trace:', error.stack);
}
