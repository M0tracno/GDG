// Path: src/services/firebaseEmailService.js
import { auth } from '../config/firebase';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

/**
 * Firebase Email Authentication Service
 * Provides comprehensive email authentication functionality
 */
class FirebaseEmailService {
  constructor() {
    this.auth = auth;
    this.user = null;
    this.authStateListeners = [];
  }
  
  // Authentication state management
  
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }
  
  async registerUser(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Other methods would follow
}

export default new FirebaseEmailService();

