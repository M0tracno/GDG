// Minimal test route file without MongoDB dependencies

console.log('🔍 Starting minimal route file execution...');

try {
  const express = require('express');
  console.log('✓ Express imported in minimal route');
  
  const router = express.Router();
  console.log('✓ Router created in minimal route');
  
  // Add a simple test route without any dependencies
  router.get('/test', (req, res) => {
    res.json({ message: 'Test route works' });
  });
  console.log('✓ Test route added');
  
  console.log('✓ Exporting router...');
  module.exports = router;
  console.log('✓ Minimal route file completed successfully');

} catch (error) {
  console.error('❌ Error in minimal route file:', error.message);
  console.error('Stack:', error.stack);
}
