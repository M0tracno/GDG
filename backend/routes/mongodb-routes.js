const express = require('express');
const router = express.Router();

// Import all MongoDB routes
const authRoutes = require('./mongodb-auth');
const facultyRoutes = require('./mongodb-faculty');
const studentRoutes = require('./mongodb-student');
const courseRoutes = require('./mongodb-course');
const enrollmentRoutes = require('./mongodb-enrollment-fixed');
const attendanceRoutes = require('./mongodb-attendance');
const markRoutes = require('./mongodb-mark');
const healthCheckRoutes = require('./health-check');

// Register routes
router.use('/health-check', healthCheckRoutes);
router.use('/auth', authRoutes);
router.use('/faculty', facultyRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/marks', markRoutes);

module.exports = router;
