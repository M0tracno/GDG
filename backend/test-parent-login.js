/**
 * Test Parent Login Workflow
 * This script tests the complete parent authentication workflow
 */

const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode < 400, status: res.statusCode, json: () => jsonData });
        } catch (error) {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, text: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testParentLogin() {
  const baseUrl = 'http://localhost:5000';
  
  // Test data - using the existing student from database
  const testData = {
    studentId: 'STU1748601790145', // Existing student ID
    phoneNumber: '9876543210' // Test phone number
  };

  console.log('Testing Parent Login Workflow...\n');

  try {    // Step 1: Send OTP
    console.log('Step 1: Sending OTP...');
    const otpResponse = await makeRequest(`${baseUrl}/api/auth/parent/send-otp`, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: testData.phoneNumber,
        studentId: testData.studentId
      }),
    });

    const otpData = otpResponse.json();
    console.log('OTP Response:', otpData);

    if (otpResponse.ok) {
      console.log('✅ OTP sent successfully');
      console.log('📱 In a real scenario, OTP would be sent to phone:', testData.phoneNumber);
      console.log('🔢 For testing, you would need the actual OTP from the phone/SMS service');
      
      // Note: In a real test, you would get the OTP from your SMS service or use a test OTP
      console.log('\nStep 2: To complete the test, you would:');
      console.log('1. Get the OTP from the SMS/phone service');
      console.log('2. Call /api/auth/parent/verify-otp with the OTP');
      console.log('3. Use the returned token to access parent dashboard');

    } else {
      console.log('❌ Failed to send OTP:', otpData.message);
    }

  } catch (error) {
    console.error('Error testing parent login:', error.message);
  }
}

// Test student dashboard endpoint
async function testStudentData() {
  console.log('\n=== Testing Student Data Access ===');
    try {
    // This would normally require authentication, but we can test the endpoint structure
    const response = await makeRequest('http://localhost:5000/api/students/STU1748601790145');
    console.log('Student endpoint response status:', response.status);
      if (response.ok) {
      const data = response.json();
      console.log('✅ Student data accessible');
    } else {
      console.log('❌ Student endpoint requires authentication (expected)');
    }
  } catch (error) {
    console.log('Student endpoint test error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Parent Login System Tests...\n');
testParentLogin().then(() => {
  testStudentData();
});
