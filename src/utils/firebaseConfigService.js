import { auth } from '../config/firebase';
import FirebaseEmailService from '../services/firebaseEmailService';
import { MockFirebaseEmailAuth } from './mockFirebaseService';

/**
 * Firebase Configuration Service
 * 
 * This module provides a factory function that returns either the real Firebase
 * authentication services or mock implementations depending on configuration.
 */


// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY', 
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];
  
  return requiredEnvVars.every(varName => {
    const value = process.env[varName];
    return value && 
           value !== 'your_api_key_here' && 
           !value.includes('your_') && 
           !value.includes('test');
  });
};

// Check if we should use demo mode (only in development with explicit flag)
const isDemoMode = () => {
  // Check for explicit demo mode flag first
  const forceDemoMode = process.env.REACT_APP_FORCE_DEMO_MODE === 'true';
  
  if (forceDemoMode) {
    return true; // Demo mode explicitly enabled
  }
  
  // Only allow demo mode in development and when explicitly forced
  if (process.env.NODE_ENV === 'production') {
    return false; // Never use demo mode in production
  }
  
  // In development, use demo mode if Firebase is not configured
  const firebaseConfigured = isFirebaseConfigured();
  
  if (!firebaseConfigured) {
    console.warn('Firebase not configured in development - using demo mode');
    return true;
  }
  
  return false;
};

// Get appropriate Firebase implementations
export const getFirebaseServices = () => {
  if (isDemoMode()) {
    console.info('Firebase config missing or demo mode enabled. Using mock Firebase services.');
    return {
      firebaseEmailService: MockFirebaseEmailAuth,
      isDemoMode: true
    };
  } else {
    return {
      firebaseEmailService: FirebaseEmailService,
      isDemoMode: false
    };
  }
};

export const setupFirebaseServices = () => {
  const services = getFirebaseServices();
  
  if (services.isDemoMode) {
    // Add a visual indicator for development mode
    if (process.env.NODE_ENV !== 'production') {
      const demoModeIndicator = document.createElement('div');
      demoModeIndicator.style.position = 'fixed';
      demoModeIndicator.style.bottom = '10px';
      demoModeIndicator.style.right = '10px';
      demoModeIndicator.style.background = 'rgba(255, 87, 34, 0.9)';
      demoModeIndicator.style.color = 'white';
      demoModeIndicator.style.padding = '8px 12px';
      demoModeIndicator.style.borderRadius = '4px';
      demoModeIndicator.style.fontSize = '12px';
      demoModeIndicator.style.fontWeight = 'bold';
      demoModeIndicator.style.zIndex = '9999';
      demoModeIndicator.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
      demoModeIndicator.textContent = '🔧 Firebase Demo Mode';
      
      document.body.appendChild(demoModeIndicator);
    }
  }
  
  return services;
};

