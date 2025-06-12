/**
 * Firebase Admin SDK Configuration for Backend
 * Handles server-side Firebase authentication verification
 */

const admin = require('firebase-admin');
const path = require('path');

let firebaseAdmin = null;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (firebaseAdmin) {
      return firebaseAdmin;
    }

    // Production configuration
    if (process.env.NODE_ENV === 'production') {
      // Use service account key file
      const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || 
                                 path.join(__dirname, '..', 'config', 'firebase-admin-service-account.json');
      
      if (require('fs').existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
        });
        
        console.log('✅ Firebase Admin SDK initialized with service account');
      } else {
        // Use environment variables if service account file not available
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        console.log('✅ Firebase Admin SDK initialized with environment variables');
      }
    } else {
      // Development configuration
      if (process.env.REACT_APP_FORCE_DEMO_MODE !== 'true') {
        console.log('⚠️ Firebase Admin SDK not initialized in development mode');
        console.log('Set REACT_APP_FORCE_DEMO_MODE=true for demo mode or configure Firebase Admin SDK');
      }
      return null;
    }

    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Firebase Admin SDK is required in production mode');
    }
    
    return null;
  }
};

/**
 * Verify Firebase ID token
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    const admin = initializeFirebaseAdmin();
    
    if (!admin) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      user: decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user by UID
 */
const getFirebaseUser = async (uid) => {
  try {
    const admin = initializeFirebaseAdmin();
    
    if (!admin) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const userRecord = await admin.auth().getUser(uid);
    return {
      success: true,
      user: userRecord
    };
  } catch (error) {
    console.error('Get Firebase user failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create custom token for user
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const admin = initializeFirebaseAdmin();
    
    if (!admin) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return {
      success: true,
      token: customToken
    };
  } catch (error) {
    console.error('Create custom token failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Disable/Enable user account
 */
const setUserActiveStatus = async (uid, disabled) => {
  try {
    const admin = initializeFirebaseAdmin();
    
    if (!admin) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    await admin.auth().updateUser(uid, { disabled });
    return {
      success: true,
      message: `User account ${disabled ? 'disabled' : 'enabled'} successfully`
    };
  } catch (error) {
    console.error('Set user active status failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Middleware to verify Firebase authentication
 */
const verifyFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No valid authorization header found'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const result = await verifyFirebaseToken(idToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase token',
        error: result.error
      });
    }

    // Add Firebase user info to request
    req.firebaseUser = result.user;
    req.firebaseUid = result.uid;
    
    next();
  } catch (error) {
    console.error('Firebase auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
      error: error.message
    });
  }
};

module.exports = {
  initializeFirebaseAdmin,
  verifyFirebaseToken,
  getFirebaseUser,
  createCustomToken,
  setUserActiveStatus,
  verifyFirebaseAuth
};
