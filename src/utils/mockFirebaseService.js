/**
 * Mock Firebase Authentication Service
 * 
 * This module provides mock implementations of Firebase authentication services
 * for use during development or when Firebase credentials are not available.
 * It mimics the behavior of both Email and Phone authentication services.
 */

// Mock user store for development
const mockUsers = {
  email: {
    'student@test.com': {
      uid: 'student-uid-123',
      email: 'student@test.com',
      password: 'password123',
      displayName: 'Test Student',
      emailVerified: true,
      role: 'student'
    },
    'faculty@test.com': {
      uid: 'faculty-uid-123',
      email: 'faculty@test.com',
      password: 'password123',
      displayName: 'Test Faculty',
      emailVerified: true,
      role: 'faculty'
    },
    'admin@test.com': {
      uid: 'admin-uid-123',
      email: 'admin@test.com',
      password: 'password123',
      displayName: 'Test Admin',
      emailVerified: true,
      role: 'admin'
    },
    'parent@test.com': {
      uid: 'parent-uid-123',
      email: 'parent@test.com',
      password: 'password123',
      displayName: 'Test Parent',
      emailVerified: true,      role: 'parent'
    }
  }
};

// In-memory authentication state
let currentUser = null;
let authStateListeners = [];

/**
 * Mock Firebase Email Authentication Service
 */
class MockFirebaseEmailService {
  constructor() {
    console.info('Using Mock Firebase Email Authentication Service');
    this.auth = {
      currentUser: null
    };
  }

  /**
   * Sign up a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} - User credential
   */
  async signUp(email, password, displayName) {
    // Check if email already exists
    if (mockUsers.email[email]) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser = {
      uid: `user-${Date.now()}`,
      email,
      password,
      displayName,
      emailVerified: true, // Auto-verify for development
      role: 'student' // Default role
    };

    // Store user
    mockUsers.email[email] = newUser;
    
    // Set as current user
    currentUser = newUser;
    this.auth.currentUser = newUser;
    
    // Notify listeners
    this._notifyAuthStateListeners(currentUser);

    return {
      success: true,
      user: currentUser,
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      emailVerified: currentUser.emailVerified,
      message: 'Account created successfully. Email automatically verified in mock mode.'
    };
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User credential
   */
  async signIn(email, password) {
    // Check if user exists
    const user = mockUsers.email[email];
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // Check password
    if (user.password !== password) {
      throw new Error('Incorrect password');
    }

    // Set as current user
    currentUser = user;
    this.auth.currentUser = user;
    
    // Notify listeners
    this._notifyAuthStateListeners(currentUser);

    return {
      success: true,
      user: currentUser,
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      emailVerified: currentUser.emailVerified,
      message: 'Login successful'
    };
  }

  /**
   * Sign out current user
   * @returns {Promise<Object>}
   */
  async signOut() {
    currentUser = null;
    this.auth.currentUser = null;
    
    // Notify listeners
    this._notifyAuthStateListeners(null);

    return {
      success: true,
      message: 'Signed out successfully'
    };
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  async resetPassword(email) {
    // Check if user exists
    const user = mockUsers.email[email];
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // In real app, this would send an email
    console.log(`MOCK: Password reset email sent to ${email}`);

    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  }

  /**
   * Resend email verification
   * @returns {Promise<Object>}
   */
  async resendEmailVerification() {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // In real app, this would send an email
    console.log(`MOCK: Verification email sent to ${currentUser.email}`);

    // Auto-verify for mock
    currentUser.emailVerified = true;
    mockUsers.email[currentUser.email].emailVerified = true;

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  }

  /**
   * Get current Firebase user
   * @returns {Object|null}
   */
  getCurrentUser() {
    return currentUser;
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChanged(callback) {
    // Add listener
    authStateListeners.push(callback);
    
    // Initial callback
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index !== -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all auth state listeners
   * @param {Object|null} user - Current user
   * @private
   */
  _notifyAuthStateListeners(user) {
    authStateListeners.forEach(listener => {
      listener(user);
    });
  }

  /**
   * Check if user email is verified
   * @returns {boolean}
   */
  isEmailVerified() {
    return currentUser ? currentUser.emailVerified : false;
  }

  /**
   * Get user token
   * @returns {Promise<string>}
   */
  async getUserToken() {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Generate a mock token
    return `mock-token-${currentUser.uid}-${Date.now()}`;
  }

  /**
   * Update user profile
   * @param {Object} profile - Profile data
   * @returns {Promise<Object>}
   */
  async updateUserProfile(profile) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Update profile
    if (profile.displayName) {
      currentUser.displayName = profile.displayName;
      mockUsers.email[currentUser.email].displayName = profile.displayName;
    }

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  }
}

export const MockFirebaseEmailAuth = new MockFirebaseEmailService();

