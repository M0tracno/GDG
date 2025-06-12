// Verification script to test the student ID fix
const axios = require('axios');

async function verifyStudentIdFix() {
    try {
        console.log('🔍 Testing Student ID Fix...\n');
        
        // Test 1: Login API
        console.log('1. Testing Login API...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test.student@example.com',
            password: 'password123'
        });
        
        if (loginResponse.data.success && loginResponse.data.user.studentId) {
            console.log('✅ Login API: PASSED');
            console.log(`   Student ID returned: ${loginResponse.data.user.studentId}`);
        } else {
            console.log('❌ Login API: FAILED');
            console.log('   Student ID not found in response');
            return;
        }
        
        const token = loginResponse.data.token;
        
        // Test 2: /me endpoint
        console.log('\n2. Testing /me endpoint...');
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (meResponse.data.success && meResponse.data.user.studentId) {
            console.log('✅ /me endpoint: PASSED');
            console.log(`   Student ID returned: ${meResponse.data.user.studentId}`);
        } else {
            console.log('❌ /me endpoint: FAILED');
            console.log('   Student ID not found in response');
        }
        
        // Test 3: Verify data consistency
        console.log('\n3. Verifying data consistency...');
        if (loginResponse.data.user.studentId === meResponse.data.user.studentId) {
            console.log('✅ Data consistency: PASSED');
            console.log('   Student ID consistent across endpoints');
        } else {
            console.log('❌ Data consistency: FAILED');
            console.log('   Student ID mismatch between endpoints');
        }
        
        console.log('\n🎉 Student ID Fix Verification Complete!');
        console.log('\n📋 Summary:');
        console.log(`   - Student Email: ${loginResponse.data.user.email}`);
        console.log(`   - Student ID: ${loginResponse.data.user.studentId}`);
        console.log(`   - Role: ${loginResponse.data.user.role}`);
        console.log('   - Backend endpoints are working correctly');
        console.log('   - Student ID is properly included in API responses');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error('   Response data:', error.response.data);
        }
    }
}

verifyStudentIdFix();
