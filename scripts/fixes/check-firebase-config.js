// Firebase Configuration Checker
// Run this to verify your Firebase setup

const checkFirebaseConfig = () => {
  console.log('🔥 Firebase Configuration Check\n');
  
  // Check environment variables
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN', 
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  console.log('📋 Environment Variables:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    const status = value && value !== 'your_firebase_api_key_here' ? '✅' : '❌';
    console.log(`${status} ${envVar}: ${value ? 'Set' : 'Missing'}`);
  });

  console.log('\n🔧 Current Configuration:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value && value !== 'your_firebase_api_key_here') {
      console.log(`${envVar}=${value.substring(0, 10)}...`);
    }
  });

  console.log('\n📖 Next Steps:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Create a new project or select existing project');
  console.log('3. Add a web app to your project');
  console.log('4. Copy the configuration values');
  console.log('5. Update your .env file');
  console.log('6. Enable Phone Authentication in Firebase Console');
  console.log('7. Add localhost to authorized domains');
};

checkFirebaseConfig();
