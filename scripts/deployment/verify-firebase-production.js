#!/usr/bin/env node

/**
 * Firebase Production Configuration Verification
 * Run this after setting up Firebase to verify everything works
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Firebase Production Configuration Verification');
console.log('================================================\n');

// Check if .env.production exists
const envPath = path.join(__dirname, '.env.production');
const backendEnvPath = path.join(__dirname, 'backend', '.env.production');

function checkEnvironmentFiles() {
  console.log('📁 Checking environment files...');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Frontend .env.production not found');
    return false;
  }
  
  if (!fs.existsSync(backendEnvPath)) {
    console.log('❌ Backend .env.production not found');
    return false;
  }
  
  console.log('✅ Environment files found');
  return true;
}

function checkFirebaseConfig() {
  console.log('\n🔥 Checking Firebase configuration...');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const requiredVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_FIREBASE_STORAGE_BUCKET',
      'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
      'REACT_APP_FIREBASE_APP_ID'
    ];
    
    let allConfigured = true;
    
    requiredVars.forEach(varName => {
      const regex = new RegExp(`${varName}=(.+)`);
      const match = envContent.match(regex);
      
      if (!match || match[1].includes('YOUR_') || match[1].includes('HERE')) {
        console.log(`❌ ${varName} not properly configured`);
        allConfigured = false;
      } else {
        console.log(`✅ ${varName} configured`);
      }
    });
    
    // Check demo mode is disabled
    if (envContent.includes('REACT_APP_FORCE_DEMO_MODE=false')) {
      console.log('✅ Demo mode disabled for production');
    } else {
      console.log('❌ Demo mode not properly disabled');
      allConfigured = false;
    }
    
    return allConfigured;
    
  } catch (error) {
    console.log('❌ Error reading environment file:', error.message);
    return false;
  }
}

function checkBackendConfig() {
  console.log('\n🗄️ Checking backend configuration...');
  
  try {
    const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
      const checks = [
      { name: 'NODE_ENV set to production', regex: /NODE_ENV=production/ },
      { name: 'JWT secret configured', regex: /JWT_SECRET=.{20,}/ },
      { name: 'MongoDB URI configured', regex: /MONGODB_URI=mongodb\+srv:/ },
      { name: 'Production CORS origins', regex: /ADDITIONAL_CORS_ORIGINS=.*https/ }
    ];
    
    let allConfigured = true;
    
    checks.forEach(check => {
      if (backendEnvContent.match(check.regex)) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name}`);
        allConfigured = false;
      }
    });
    
    return allConfigured;
    
  } catch (error) {
    console.log('❌ Error reading backend environment file:', error.message);
    return false;
  }
}

function checkFirebaseFiles() {
  console.log('\n📂 Checking Firebase configuration files...');
  
  const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
  const firebaseAdminPath = path.join(__dirname, 'backend', 'config', 'firebaseAdmin.js');
  
  let allFound = true;
  
  if (fs.existsSync(firebaseConfigPath)) {
    console.log('✅ Frontend Firebase config found');
  } else {
    console.log('❌ Frontend Firebase config missing');
    allFound = false;
  }
  
  if (fs.existsSync(firebaseAdminPath)) {
    console.log('✅ Backend Firebase Admin config found');
  } else {
    console.log('❌ Backend Firebase Admin config missing');
    allFound = false;
  }
  
  return allFound;
}

function generateTodoList(envOk, firebaseOk, backendOk, filesOk) {
  console.log('\n📋 TODO LIST:');
  console.log('=============');
  
  if (!envOk) {
    console.log('□ Create and configure .env.production files');
  }
  
  if (!firebaseOk) {
    console.log('□ Complete Firebase Console setup');
    console.log('  - Create Firebase project');
    console.log('  - Enable Email/Password authentication');
    console.log('  - Copy configuration to .env.production');
  }
  
  if (!backendOk) {
    console.log('□ Configure backend production settings');
  }
  
  if (!filesOk) {
    console.log('□ Ensure Firebase configuration files exist');
  }
  
  console.log('□ Add authorized domains in Firebase Console');
  console.log('□ Test user registration and email verification');
  console.log('□ Deploy to production platform');
  console.log('□ Test complete authentication flow');
  
  if (envOk && firebaseOk && backendOk && filesOk) {
    console.log('\n🎉 ALL CHECKS PASSED!');
    console.log('Your Firebase is ready for production deployment!');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Deploy to your hosting platform');
    console.log('2. Set environment variables in hosting platform');
    console.log('3. Test complete user flow');
    console.log('4. Monitor Firebase Console for user activity');
  } else {
    console.log('\n⚠️  Some configuration items need attention.');
    console.log('Complete the TODO items above, then run this script again.');
  }
}

// Run all checks
const envOk = checkEnvironmentFiles();
const firebaseOk = checkFirebaseConfig();
const backendOk = checkBackendConfig();
const filesOk = checkFirebaseFiles();

generateTodoList(envOk, firebaseOk, backendOk, filesOk);
