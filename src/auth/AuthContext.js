import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupFirebaseServices } from '../utils/firebaseConfigService';

import { toString } from '@mui/material';
// Use firebaseConfigService instead of direct imports

// Get Firebase services (real or mock based on configuration)
const { firebaseEmailService } = setupFirebaseServices();

// Create the Auth Context
const AuthContext = createContext();

// Export AuthContext for use in other contexts
export { AuthContext };

// Custom hook to use the Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [initFailed, setInitFailed] = useState(false);

  // Initialize authentication
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log('Initializing authentication system');
        
        // Check for existing session
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          try {
            // Get the API base URL from environment or use fallback
            const apiBaseUrl = process.env.REACT_APP_API_URL || 
                             (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
            
            console.log('Using API base URL for auth verification:', apiBaseUrl);
                
            // Verify token with MongoDB backend
            const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include'
            });

            if (response.ok) {
              const responseData = await response.json();
              const freshUser = responseData.user;
              
              // Update localStorage with fresh user data
              localStorage.setItem('userData', JSON.stringify(freshUser));
              
              setCurrentUser(freshUser);
              setUserRole(freshUser.role);
              console.log('Restored user session with fresh data:', freshUser);
            } else {
              // Handle token verification errors
              if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                throw new Error('Session expired. Please login again.');
              } else if (response.status === 404) {
                // User not found in database
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                throw new Error('User account not found. Please contact support.');
              } else {
                throw new Error('Invalid token');
              }
            }
          } catch (e) {
            console.error('Error verifying token:', e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
        
        setLoading(false);
      } catch (e) {
        console.error("Error initializing authentication:", e);
        setLoading(false);
        setInitFailed(true);
      }
    };

    verifyToken();
  }, []);

  // Authentication functions
  // Helper function to process successful login
  const processSuccessfulLogin = (data) => {
    // Store token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    setCurrentUser(data.user);
    setUserRole(data.user.role);
  };

  // Login function with role parameter
  const login = async (email, password, role) => {
    try {
      // Get the API base URL from environment or use fallback
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      console.log('Login attempt:', { email, role, apiBaseUrl });
      
      // Use the mockLoginService for development/demo mode
      if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        console.log('Using mock authentication in demo mode');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = {
          success: true,
          user: {
            id: `mock-${role}-id`,
            name: role === 'admin' ? 'Krishna Admin' : 
                  role === 'faculty' ? 'Dronacharya' : 
                  role === 'parent' ? 'Gandhari' : 'Arjun',
            email,
            role,
            permissions: ['view', 'edit'],
            verified: true,
          },
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15)
        };
        
        // Store token and user data
        processSuccessfulLogin(mockData);
        return { user: mockData.user, token: mockData.token };
      }
      
      // Use different endpoint for parent login
      let endpoint = '/api/auth/login';
      if (role === 'parent') {
        endpoint = '/api/auth/parent/login';
      }
      
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
      });

      // Process the API response
      const data = await response.json();

      if (!response.ok) {
        // Handle different types of MongoDB/authentication errors
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid credentials');
        } else if (response.status === 401) {
          throw new Error('Access denied. Please check your credentials.');
        } else if (response.status === 403) {
          throw new Error('Account is inactive. Please contact administrator.');
        } else if (response.status === 404) {
          throw new Error('User not found with this email address.');
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }

      // Process successful response
      processSuccessfulLogin(data);
      return { user: data.user, token: data.token };
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, role, displayName) => {
    try {
      const endpoint = role === 'faculty' ? '/api/auth/register/faculty' : '/api/auth/register/student';
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: displayName?.split(' ')[0] || '',
          lastName: displayName?.split(' ')[1] || '',
          ...(role === 'faculty' && {
            employeeId: `EMP${Date.now()}`,
            department: 'General'
          }),
          ...(role === 'student' && {
            studentId: `STU${Date.now()}`,
            grade: 'General'
          })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after successful registration
      return await login(email, password, role);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return Promise.resolve();
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Parent authentication functions
  const parentLogin = async (token, parentData) => {
    try {
      // Store parent authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(parentData));
      localStorage.setItem('userRole', 'parent');
      
      setCurrentUser(parentData);
      setUserRole('parent');
      
      console.log('Parent logged in successfully:', parentData);
      return { success: true, user: parentData };
    } catch (error) {
      console.error('Parent login error:', error);
      throw error;
    }
  };

  const sendParentOTP = async (phoneNumber, studentId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          studentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  const verifyParentOTP = async (phoneNumber, otp, otpId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
          otpId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Automatically login the parent after successful OTP verification
      await parentLogin(data.token, data.parent);
      
      return data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  // MSG91 functions
  const getMSG91Config = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/widget-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get widget config');
      }

      return data.data;
    } catch (error) {
      console.error('Get MSG91 config error:', error);
      throw error;
    }
  };

  const sendMSG91OTP = async (phoneNumber, studentId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/send-msg91-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          studentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP via MSG91');
      }

      return data;
    } catch (error) {
      console.error('Send MSG91 OTP error:', error);
      throw error;
    }
  };

  const verifyMSG91OTP = async (phoneNumber, otp, requestId, studentId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/verify-msg91-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
          requestId,
          studentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP with MSG91');
      }

      // Store auth data
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.parent));
      
      setCurrentUser(data.data.parent);
      setUserRole('parent');

      return data;
    } catch (error) {
      console.error('Verify MSG91 OTP error:', error);
      throw error;
    }
  };

  const verifyMSG91Token = async (jwtToken, studentId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/parent/verify-msg91-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwtToken,
          studentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid token');
      }

      // Automatically login the parent after successful token verification
      await parentLogin(data.data.token, data.data.parent);
      
      return data;
    } catch (error) {
      console.error('Verify MSG91 token error:', error);
      throw error;
    }
  };

  /*
  // Firebase phone authentication (REMOVED - OTP functionality disabled)
  const firebaseLogin = async (phoneNumber, appVerifier) => {
    // This function has been removed as part of OTP functionality cleanup
    throw new Error('Phone authentication has been disabled');
  };

  const firebaseLogout = async () => {
    // This function has been removed as part of OTP functionality cleanup  
    throw new Error('Phone authentication has been disabled');
  };

  // Firebase Phone Authentication functions (REMOVED - OTP functionality disabled)
  const initializeFirebaseRecaptcha = async (containerId) => {
    // This function has been removed as part of OTP functionality cleanup
    throw new Error('Phone authentication has been disabled');
  };

  const sendFirebaseOTP = async (phoneNumber, studentId) => {
    // This function has been removed as part of OTP functionality cleanup
    throw new Error('Phone authentication has been disabled');
  };

  const verifyFirebaseOTP = async (confirmationResult, otp, studentId) => {
    // This function has been removed as part of OTP functionality cleanup
    throw new Error('Phone authentication has been disabled');
  };

  const signOutFirebase = async () => {
    // This function has been removed as part of OTP functionality cleanup
    throw new Error('Phone authentication has been disabled');
  };
  */

  // Firebase Email Authentication functions
  const firebaseEmailSignUp = async (email, password, displayName, userData = {}) => {
    try {
      // Create user with Firebase
      const result = await firebaseEmailService.signUp(email, password, displayName);
      
      if (!result.success) {
        throw new Error(result.message || 'Firebase signup failed');
      }

      // Store additional user data for backend registration
      const combinedUserData = {
        email,
        displayName,
        firebaseUid: result.uid,
        emailVerified: result.emailVerified,
        ...userData
      };

      return {
        success: true,
        user: result.user,
        uid: result.uid,
        email: result.email,
        displayName: result.displayName,
        emailVerified: result.emailVerified,
        userData: combinedUserData,
        message: result.message
      };
    } catch (error) {
      console.error('Firebase email signup error:', error);
      throw error;
    }
  };

  const firebaseEmailSignIn = async (email, password) => {
    try {
      const result = await firebaseEmailService.signIn(email, password);
      
      if (!result.success) {
        throw new Error(result.message || 'Firebase signin failed');
      }

      // Set user data in context
      setCurrentUser(result.user);
      setUserRole('pending'); // Will be updated after backend verification
      
      // Store in localStorage
      localStorage.setItem('firebaseAuthToken', result.uid);
      localStorage.setItem('userData', JSON.stringify(result.user));

      return result;
    } catch (error) {
      console.error('Firebase email signin error:', error);
      throw error;
    }
  };

  const firebaseEmailSignOut = async () => {
    try {
      await firebaseEmailService.signOut();
      setCurrentUser(null);
      setUserRole(null);
      localStorage.removeItem('firebaseAuthToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      console.error('Firebase email signout error:', error);
      throw error;
    }
  };

  const firebaseResetPassword = async (email) => {
    try {
      return await firebaseEmailService.resetPassword(email);
    } catch (error) {
      console.error('Firebase reset password error:', error);
      throw error;
    }
  };

  const firebaseResendEmailVerification = async () => {
    try {
      return await firebaseEmailService.resendEmailVerification();
    } catch (error) {
      console.error('Firebase resend verification error:', error);
      throw error;
    }
  };

  const isFirebaseEmailVerified = () => {
    return firebaseEmailService.isEmailVerified();
  };

  const getFirebaseUserToken = async () => {
    try {
      return await firebaseEmailService.getUserToken();
    } catch (error) {
      console.error('Get Firebase token error:', error);
      throw error;
    }
  };

  const updateFirebaseUserProfile = async (profile) => {
    try {
      return await firebaseEmailService.updateUserProfile(profile);
    } catch (error) {
      console.error('Update Firebase profile error:', error);
      throw error;
    }
  };

  // Unified authentication function for backend integration
  const verifyFirebaseEmailAuth = async (firebaseUser, userRole, additionalData = {}) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 
                       (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-firebase-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          role: userRole,
          ...additionalData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Backend authentication failed');
      }

      // Store backend auth token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      setUserRole(data.user.role);

      return data;
    } catch (error) {
      console.error('Verify Firebase email auth error:', error);
      throw error;
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseEmailService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase auth state changed - User signed in:', firebaseUser.email);
        // Auto-sync with context if needed
        if (!currentUser || currentUser.uid !== firebaseUser.uid) {
          setCurrentUser(firebaseUser);
        }
      } else {
        console.log('Firebase auth state changed - User signed out');
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Context value
  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    parentLogin,
    sendParentOTP,
    verifyParentOTP,
    getMSG91Config,
    sendMSG91OTP,
    verifyMSG91OTP,
    verifyMSG91Token,
    // Firebase Email Authentication methods
    firebaseEmailSignUp,
    firebaseEmailSignIn,
    firebaseEmailSignOut,
    firebaseResetPassword,
    firebaseResendEmailVerification,
    isFirebaseEmailVerified,
    getFirebaseUserToken,
    updateFirebaseUserProfile,
    verifyFirebaseEmailAuth
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading application...</p>
      </div>
    );
  }

  if (initFailed) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'red' }}>Initialization Error</h2>
        <p>Failed to initialize the application. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}



