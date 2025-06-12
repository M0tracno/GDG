const express = require('express');
const parentAuthController = require('../controllers/mongodb-parentAuthController');
const { parentAuth } = require('../middleware/auth');

const router = express.Router();

// Email/Password authentication routes
router.post('/parent/login', parentAuthController.loginWithEmail);
router.post('/parent/register', parentAuthController.registerWithEmail);

// Firebase authentication routes (primary method)
router.post('/parent/verify-student', parentAuthController.verifyStudent);
router.post('/parent/verify-firebase-auth', parentAuthController.verifyFirebaseAuth);

// Parent profile and session management
router.get('/parent/profile', parentAuth, parentAuthController.getProfile);
router.put('/parent/profile', parentAuth, parentAuthController.updateProfile);
router.post('/parent/logout', parentAuth, parentAuthController.logout);

module.exports = router;
