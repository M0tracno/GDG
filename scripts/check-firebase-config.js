#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * Run this to verify your Firebase setup is correct
 */

console.log('🔥 Firebase Configuration Checker\n');

// Check if we're in a React environment
const isReactEnv = typeof process !== 'undefined' && process.env;

if (!isReactEnv) {
  console.log('❌ This script should be run in a Node.js environment');
  console.log('💡 Run this from your project root: node scripts/check-firebase-config.js');
  process.exit(1);
}

// Required Firebase environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN', 
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

console.log('📋 Environment Variables Check:');
console.log('================================');

let allConfigured = true;
let hasValidKeys = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  
  if (!value) {
    console.log(`❌ ${envVar}: Missing`);
    allConfigured = false;
  } else if (value.includes('your_') || value.includes('test') || value.includes('demo')) {
    console.log(`⚠️  ${envVar}: Placeholder value detected`);
    hasValidKeys = false;
  } else {
    console.log(`✅ ${envVar}: Configured`);
  }
});

// Check demo mode
const demoMode = process.env.REACT_APP_FORCE_DEMO_MODE;
console.log(`\n🎭 Demo Mode: ${demoMode === 'true' ? 'ENABLED' : 'DISABLED'}`);

// Check API key format
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
if (apiKey) {
  const isValidFormat = apiKey.startsWith('AIza') && apiKey.length > 35;
  console.log(`🔑 API Key Format: ${isValidFormat ? 'Valid' : 'Invalid'}`);
  
  if (!isValidFormat) {
    console.log('   💡 Real Firebase API keys start with "AIza" and are ~39 characters long');
  }
}

// Summary
console.log('\n📊 Summary:');
console.log('===========');

if (demoMode === 'true') {
  console.log('🎭 Currently running in DEMO MODE');
  console.log('   - This is fine for testing');
  console.log('   - No real Firebase project needed');
  console.log('   - Mock authentication services active');
} else if (allConfigured && hasValidKeys) {
  console.log('✅ Firebase configuration looks good!');
  console.log('   - All required variables are set');
  console.log('   - No placeholder values detected');
  console.log('   - Ready for production use');
} else {
  console.log('⚠️  Firebase configuration needs attention:');
  
  if (!allConfigured) {
    console.log('   - Some environment variables are missing');
  }
  
  if (!hasValidKeys) {
    console.log('   - Placeholder values detected (need real Firebase keys)');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Create a Firebase project: https://console.firebase.google.com');
  console.log('2. Enable Authentication → Email/Password');
  console.log('3. Get your config from Project Settings → General');
  console.log('4. Update your environment variables');
  console.log('5. Add your domain to authorized domains');
}

// Environment-specific advice
console.log('\n🚀 Environment-Specific Setup:');
console.log('===============================');

if (process.env.NETLIFY) {
  console.log('📱 Netlify detected:');
  console.log('   - Update environment variables in Netlify dashboard');
  console.log('   - Go to Site Settings → Environment Variables');
  console.log('   - Add all REACT_APP_FIREBASE_* variables');
} else if (process.env.VERCEL) {
  console.log('🔺 Vercel detected:');
  console.log('   - Update environment variables in Vercel dashboard');
  console.log('   - Go to Project Settings → Environment Variables');
} else {
  console.log('💻 Local development:');
  console.log('   - Create a .env.local file');
  console.log('   - Add your Firebase configuration variables');
  console.log('   - Restart your development server');
}

// Final message
if (demoMode !== 'true' && (!allConfigured || !hasValidKeys)) {
  console.log('\n🚨 IMPORTANT: Your app may experience Firebase authentication errors');
  console.log('   until real Firebase credentials are configured.');
}

console.log('\n📖 For detailed setup instructions, see:');
console.log('   - FIREBASE_ERRORS_FIXED.md');
console.log('   - FIREBASE_PRODUCTION_SETUP.md');
