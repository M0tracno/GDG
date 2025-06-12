// List all registered routes

const express = require('express');

function listRoutes(app) {
  console.log('=== Registered Routes ===');
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Routes registered directly on the app
      console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // Router middleware
      const routerName = middleware.regexp.source;
      console.log(`\nRouter: ${routerName}`);
      
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          console.log(`  ${methods} ${handler.route.path}`);
        }
      });
    }
  });
}

// Test with our route files
const parentAuthRoutes = require('./routes/mongodb-parentAuth');
const parentDashboardRoutes = require('./routes/mongodb-parentDashboard');

console.log('Parent Auth Routes type:', typeof parentAuthRoutes);
console.log('Parent Dashboard Routes type:', typeof parentDashboardRoutes);

const testApp = express();
testApp.use('/api/auth', parentAuthRoutes);
testApp.use('/api/parents', parentDashboardRoutes);

listRoutes(testApp);
