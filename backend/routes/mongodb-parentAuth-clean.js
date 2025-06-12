const express = require('express');
const parentAuthController = require('../controllers/mongodb-parentAuthController');
const { parentAuth } = require('../middleware/auth');

const router = express.Router();

// Parent OTP authentication routes
router.post('/parent/send-otp', parentAuthController.sendOTP);
router.post('/parent/verify-otp', parentAuthController.verifyOTP);
router.get('/parent/profile', parentAuth, parentAuthController.getProfile);
router.put('/parent/profile', parentAuth, parentAuthController.updateProfile);
router.post('/parent/logout', parentAuth, parentAuthController.logout);

module.exports = router;
