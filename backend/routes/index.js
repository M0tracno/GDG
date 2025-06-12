const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth');
const facultyRoutes = require('./faculty');
const studentRoutes = require('./student');
const courseRoutes = require('./course');
const enrollmentRoutes = require('./enrollment');
const attendanceRoutes = require('./attendance');
const markRoutes = require('./mark');
const healthCheckRoutes = require('./health-check');

// Register routes
router.use('/health-check', healthCheckRoutes);
router.use('/api/faculty', facultyRoutes);
router.use('/api/students', studentRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api/enrollments', enrollmentRoutes);
router.use('/api/attendance', attendanceRoutes);
router.use('/api/marks', markRoutes);

module.exports = router; 