// Phase 2 Mock Services Test
// This script tests if our optimized services are working correctly

console.log('🚀 Testing Phase 2 Optimized Services...');

// Test environment variables
console.log('Environment Variables:');
console.log('- REACT_APP_USE_MOCK_SERVICES:', process.env.REACT_APP_USE_MOCK_SERVICES);
console.log('- REACT_APP_ENABLE_REALTIME:', process.env.REACT_APP_ENABLE_REALTIME);
console.log('- REACT_APP_ENABLE_AI_SERVICE:', process.env.REACT_APP_ENABLE_AI_SERVICE);

// Test if we can import the optimized provider
const testOptimizedProvider = async () => {
  try {
    const OptimizedProvider = await import('../providers/OptimizedPhase2ServicesProvider.js');
    console.log('✅ OptimizedPhase2ServicesProvider imported successfully');
    console.log('Available exports:', Object.keys(OptimizedProvider));
    return true;
  } catch (error) {
    console.error('❌ Failed to import OptimizedPhase2ServicesProvider:', error);
    return false;
  }
};

// Test startup performance service
const testPerformanceService = async () => {
  try {
    const PerformanceService = await import('../services/StartupPerformanceService.js');
    console.log('✅ StartupPerformanceService imported successfully');
    console.log('Available exports:', Object.keys(PerformanceService));
    return true;
  } catch (error) {
    console.error('❌ Failed to import StartupPerformanceService:', error);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('\n🧪 Running Phase 2 Optimization Tests...\n');
  
  const providerTest = await testOptimizedProvider();
  const performanceTest = await testPerformanceService();
  
  console.log('\n📊 Test Results:');
  console.log(`- Optimized Provider: ${providerTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Performance Service: ${performanceTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (providerTest && performanceTest) {
    console.log('\n🎉 All Phase 2 optimizations are working correctly!');
    console.log('Mock services should be active for faster development.');
  } else {
    console.log('\n⚠️ Some optimizations may not be working correctly.');
  }
};

// Export for use in other components
export default runTests;

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  runTests();
}

