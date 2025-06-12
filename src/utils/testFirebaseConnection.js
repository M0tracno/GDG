import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Test Firebase Connection
// This will help verify if Firebase is properly configured


const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase Connection...\n');
    
    // Check environment variables
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };
    
    console.log('📋 Configuration Check:');
    Object.entries(config).forEach(([key, value]) => {
      const status = value && value !== 'your_firebase_api_key_here' ? '✅' : '❌';
      console.log(`${status} ${key}: ${value ? 'Set' : 'Missing'}`);
    });
    
    // Test Firebase initialization
    console.log('\n🔧 Testing Firebase App Initialization...');
    const app = initializeApp(config);
    console.log('✅ Firebase app initialized successfully');
    
    // Test Auth initialization
    console.log('🔐 Testing Firebase Auth...');
    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized successfully');
    
    // Check if we're in development and can use emulator
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode detected');
      console.log('💡 You can use Firebase Auth Emulator for testing');
    }
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\n📖 Next Steps:');
    console.log('1. Go to Firebase Console and enable Phone Authentication');
    console.log('2. Add localhost to authorized domains');
    console.log('3. Test phone authentication in your app');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Firebase configuration in .env file');
    console.log('2. Ensure you have a valid Firebase project');
    console.log('3. Check if Phone Authentication is enabled');
    console.log('4. Verify authorized domains include localhost');
    
    return false;
  }
};

// For testing in browser console
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
  console.log('🔥 Firebase test loaded. Run testFirebaseConnection() to test.');
}

export default testFirebaseConnection;




