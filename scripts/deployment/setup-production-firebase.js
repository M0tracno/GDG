#!/usr/bin/env node

/**
 * Production Environment Configuration Script
 * Sets up real Firebase services for production deployment
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Firebase Production Configuration Setup');
console.log('==========================================\n');

console.log('This script will help you configure Firebase for PRODUCTION use with:');
console.log('✅ Real Firebase Authentication');
console.log('✅ Real Email Services');
console.log('✅ MongoDB Database');
console.log('✅ Production Security Settings');
console.log('❌ NO Demo Mode\n');

console.log('🔐 Prerequisites:');
console.log('1. Firebase project created in Firebase Console');
console.log('2. Email/Password authentication enabled');
console.log('3. MongoDB Atlas cluster configured');
console.log('4. Production domain ready\n');

const questions = [
  '🔑 Enter your Firebase API Key: ',
  '🌐 Enter your Firebase Auth Domain (project-id.firebaseapp.com): ',
  '📁 Enter your Firebase Project ID: ',
  '💾 Enter your Firebase Storage Bucket (project-id.firebasestorage.app): ',
  '📧 Enter your Firebase Messaging Sender ID: ',
  '📱 Enter your Firebase App ID: ',
  '📊 Enter your Firebase Measurement ID (optional): ',
  '🌍 Enter your Production API URL: ',
  '🤖 Enter your Google Gemini API Key: ',
  '🗄️ Enter your MongoDB Connection URI: '
];

const envKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_MEASUREMENT_ID',
  'REACT_APP_API_URL',
  'REACT_APP_GEMINI_API_KEY',
  'MONGODB_URI'
];

const answers = [];
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion < questions.length) {
    rl.question(questions[currentQuestion], (answer) => {
      answers.push(answer.trim());
      currentQuestion++;
      askQuestion();
    });
  } else {
    createProductionConfig();
    rl.close();
  }
}

function createProductionConfig() {
  try {
    // Create frontend .env.production
    const frontendEnvContent = `# Firebase Configuration - PRODUCTION
REACT_APP_FIREBASE_API_KEY=${answers[0]}
REACT_APP_FIREBASE_AUTH_DOMAIN=${answers[1]}
REACT_APP_FIREBASE_PROJECT_ID=${answers[2]}
REACT_APP_FIREBASE_STORAGE_BUCKET=${answers[3]}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${answers[4]}
REACT_APP_FIREBASE_APP_ID=${answers[5]}
REACT_APP_FIREBASE_MEASUREMENT_ID=${answers[6]}

# API Configuration - PRODUCTION
REACT_APP_API_URL=${answers[7]}
REACT_APP_FORCE_DEMO_MODE=false
NODE_ENV=production

# Google Gemini API - PRODUCTION
REACT_APP_GEMINI_API_KEY=${answers[8]}

# Security Settings - PRODUCTION
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
`;

    // Create backend .env.production
    const backendEnvContent = `# Server Configuration - PRODUCTION
NODE_ENV=production
PORT=5000

# JWT Settings - PRODUCTION (GENERATE A SECURE SECRET)
JWT_SECRET=${generateSecureJWTSecret()}
JWT_EXPIRES_IN=7d

# Database Settings - PRODUCTION
DB_TYPE=mongodb
MONGODB_URI=${answers[9]}

# CORS Configuration - PRODUCTION
ADDITIONAL_CORS_ORIGINS=${answers[7]},https://your-domain.com

# Security Settings - PRODUCTION
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10

# Logging - PRODUCTION
LOG_LEVEL=error

# Firebase Admin SDK (for backend verification)
# TODO: Add Firebase Admin SDK service account key path
# FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=./config/firebase-admin-service-account.json
`;

    // Write frontend production config
    fs.writeFileSync(path.join(__dirname, '.env.production'), frontendEnvContent);
    
    // Write backend production config
    fs.writeFileSync(path.join(__dirname, 'backend', '.env.production'), backendEnvContent);

    console.log('\n✅ Production configuration files created!');
    console.log('\n📁 Files created:');
    console.log('  - .env.production (Frontend)');
    console.log('  - backend/.env.production (Backend)');

    console.log('\n🔐 SECURITY REMINDERS:');
    console.log('❌ NEVER commit these .env files to Git');
    console.log('✅ Use environment variables in your hosting platform');
    console.log('✅ Rotate secrets regularly');
    console.log('✅ Enable Firebase security monitoring');

    console.log('\n🚀 Next Steps:');
    console.log('1. Upload environment variables to your hosting platform (Vercel/Netlify/Render)');
    console.log('2. Download Firebase Admin SDK service account key');
    console.log('3. Configure authorized domains in Firebase Console');
    console.log('4. Test authentication in staging environment');
    console.log('5. Deploy to production');

    console.log('\n📊 Production Checklist:');
    console.log('□ Firebase Authentication configured');
    console.log('□ MongoDB Atlas connected');
    console.log('□ Email verification enabled');
    console.log('□ Security rules configured');
    console.log('□ Monitoring enabled');
    console.log('□ Error reporting configured');
    console.log('□ Performance monitoring enabled');
    console.log('□ Authorized domains configured');
    console.log('□ Production deployment tested');

  } catch (error) {
    console.error('\n❌ Error creating configuration files:', error.message);
    console.log('Please create the files manually using the provided template.');
  }
}

function generateSecureJWTSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < 64; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Start the configuration process
console.log('🚀 Ready to configure Firebase for production?');
rl.question('Continue? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\n📝 Please provide the following information:\n');
    askQuestion();
  } else {
    console.log('Configuration cancelled.');
    rl.close();
  }
});
