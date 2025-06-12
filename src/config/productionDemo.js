/**
 * Production Demo Configuration
 * Provides mock data and services for production demo mode
 */

export const DEMO_USERS = {
  admin: {
    email: 'admin@gdg.school',
    password: 'admin123',
    name: 'Krishna Admin',
    role: 'admin',
    id: 'admin-demo-001'
  },
  faculty: {
    email: 'faculty@gdg.school', 
    password: 'faculty123',
    name: 'Dronacharya',
    role: 'faculty',
    id: 'faculty-demo-001'
  },
  parent: {
    email: 'parent@gdg.school',
    password: 'parent123', 
    name: 'Gandhari',
    role: 'parent',
    id: 'parent-demo-001'
  },
  student: {
    email: 'student@gdg.school',
    password: 'student123',
    name: 'Arjun',
    role: 'student', 
    id: 'student-demo-001'
  }
};

export const isDemoMode = () => {
  return process.env.REACT_APP_FORCE_DEMO_MODE === 'true' ||
         process.env.NODE_ENV === 'development';
};

export const getDemoUser = (email, role) => {
  const users = Object.values(DEMO_USERS);
  return users.find(user => user.email === email && user.role === role) ||
         users.find(user => user.role === role) ||
         DEMO_USERS.admin;
};

export const DEMO_CONFIG = {
  showBanner: true,
  bannerText: '🎭 Demo Mode - All data is simulated for demonstration purposes',
  allowRegistration: false,
  mockApiCalls: true,
  simulateNetworkDelay: true,
  networkDelayMs: 800
};
