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
         firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
         !firebaseConfig.apiKey.includes('demo') &&
         !firebaseConfig.apiKey.includes('test') &&
         firebaseConfig.apiKey.startsWith('AIza'); // Real Firebase API keys start with this
};

let app, auth, analytics;

// Check if demo mode is enabled before initializing Firebase
const isDemoMode = process.env.REACT_APP_FORCE_DEMO_MODE === 'true';

if (isDemoMode) {
  console.log('🔧 Demo mode enabled - Using mock Firebase services');
  // Provide mock auth object for demo mode
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.reject(new Error('Demo mode'))
  };
} else {
  try {
    // Only initialize Firebase if not in demo mode
    if (isValidConfig()) {
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      
      // Initialize Firebase Authentication
      auth = getAuth(app);
      
      // Initialize Analytics only if config is valid
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
        } catch (analyticsError) {
          console.warn('Firebase Analytics initialization failed:', analyticsError.message);
          // Analytics failure is not critical, continue without it
        }
      }
      
      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase configuration is invalid - some features may not work');
      // Provide basic mock auth when config is invalid
      auth = {
        currentUser: null,
        onAuthStateChanged: () => () => {},
        signOut: () => Promise.resolve(),
        signInWithEmailAndPassword: () => Promise.reject(new Error('Invalid config'))
      };
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    
    // Provide helpful error messages based on error type
    if (error.message.includes('API key not valid')) {
      console.error('🔥 Firebase Error: Invalid API key detected!');
      console.error('📋 Please check your Firebase configuration:');
      console.error('1. Ensure you have a valid Firebase project');
      console.error('2. Check your API key in environment variables');
      console.error('3. Verify the project ID matches your Firebase console');
      console.error('4. Make sure the project is not deleted or suspended');
      console.error('💡 Or enable demo mode by setting REACT_APP_FORCE_DEMO_MODE=true');
    }
    
    // Provide fallback mock auth object
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: () => Promise.resolve(),
      signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase initialization failed'))
    };
  }
}

export { auth, analytics };
export default app;




