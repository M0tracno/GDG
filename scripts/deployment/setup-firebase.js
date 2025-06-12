#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Console Integration Setup');
console.log('=====================================\n');

console.log('Follow these steps to set up Firebase for your project:\n');

console.log('1. 🌐 Go to Firebase Console:');
console.log('   https://console.firebase.google.com/\n');

console.log('2. ➕ Create a New Project:');
console.log('   - Click "Create a project"');
console.log('   - Project name: "GDC-School-Management"');
console.log('   - Enable Google Analytics (optional)\n');

console.log('3. 🌍 Add Web App:');
console.log('   - Click the Web icon </> in project overview');
console.log('   - App nickname: "GDC-Web-App"');
console.log('   - Register app\n');

console.log('4. 📋 Copy Firebase Configuration:');
console.log('   You\'ll get a config object like this:');
console.log(`
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456",
     measurementId: "G-XXXXXXXXXX"
   };
`);

console.log('5. 🔐 Enable Phone Authentication:');
console.log('   - Go to Authentication → Sign-in method');
console.log('   - Click "Phone" and enable it');
console.log('   - Add authorized domains: localhost, 127.0.0.1\n');

console.log('6. 🧪 Add Test Phone Numbers (Optional):');
console.log('   - Go to Authentication → Settings');
console.log('   - Add test phone numbers:');
console.log('     Phone: +91 9999999999, Code: 123456\n');

rl.question('Have you completed steps 1-6? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\n🎉 Great! Now let\'s update your environment variables.\n');
    
    const questions = [
      'Enter your Firebase API Key: ',
      'Enter your Auth Domain (project-id.firebaseapp.com): ',
      'Enter your Project ID: ',
      'Enter your Storage Bucket (project-id.appspot.com): ',
      'Enter your Messaging Sender ID: ',
      'Enter your App ID: ',
      'Enter your Measurement ID (optional): '
    ];
    
    const envKeys = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_FIREBASE_STORAGE_BUCKET',
      'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
      'REACT_APP_FIREBASE_APP_ID',
      'REACT_APP_FIREBASE_MEASUREMENT_ID'
    ];
    
    const answers = [];
    let currentQuestion = 0;
    
    const askQuestion = () => {
      if (currentQuestion < questions.length) {
        rl.question(questions[currentQuestion], (answer) => {
          answers.push(answer.trim());
          currentQuestion++;
          askQuestion();
        });
      } else {
        updateEnvFile(envKeys, answers);
        rl.close();
      }
    };
    
    askQuestion();
  } else {
    console.log('\n📖 Please complete the Firebase Console setup first, then run this script again.');
    rl.close();
  }
});

function updateEnvFile(keys, values) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    keys.forEach((key, index) => {
      const value = values[index];
      if (value) {
        const regex = new RegExp(`${key}=.*`, 'g');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment variables updated successfully!');
    console.log('🔄 Please restart your development server to apply changes.');
    console.log('\n🧪 Test your Firebase setup by:');
    console.log('1. Running: npm start');
    console.log('2. Going to the Firebase Parent Login page');
    console.log('3. Testing phone authentication');
    
  } catch (error) {
    console.error('\n❌ Error updating .env file:', error.message);
    console.log('Please manually update your .env file with the Firebase configuration.');
  }
}
