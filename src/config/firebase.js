import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const isValidConfig = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         firebaseConfig.apiKey !== 'your_firebase_api_key_here';
};

let app, auth, analytics;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication
  auth = getAuth(app);
  
  // Initialize Analytics only if config is valid
  if (isValidConfig() && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error.message);
  
  // In demo mode, provide mock auth object
  if (process.env.REACT_APP_FORCE_DEMO_MODE === 'true') {
    console.log('Running in demo mode - Firebase errors are expected');
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: () => Promise.resolve(),
      signInWithEmailAndPassword: () => Promise.reject(new Error('Demo mode'))
    };
  }
}

export { auth, analytics };
export default app;




