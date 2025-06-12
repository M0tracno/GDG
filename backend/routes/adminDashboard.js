/**
 * Admin Dashboard Routes
 * Handles all admin dashboard API endpoints
 */

const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Import course controller for course management
const { courseController } = require('../controllers/mongodb-controllers');

/**
 * @route   GET /api/admin/dashboard/summary
 * @desc    Get admin dashboard summary with real database counts
 * @access  Private (Admin only)
 */
router.get('/dashboard/summary', auth, roleAuth(['admin']), adminDashboardController.getDashboardSummary);

/**
 * @route   GET /api/admin/metrics/realtime
 * @desc    Get real-time system metrics and active user counts
 * @access  Private (Admin only)
 */
router.get('/metrics/realtime', auth, roleAuth(['admin']), adminDashboardController.getRealTimeMetrics);

/**
 * @route   GET /api/admin/system/health
 * @desc    Get system health status for all services
 * @access  Private (Admin only)
 */
router.get('/system/health', auth, roleAuth(['admin']), adminDashboardController.getSystemHealth);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get system analytics and detailed statistics
 * @access  Private (Admin only)
 */
router.get('/analytics', auth, roleAuth(['admin']), adminDashboardController.getSystemAnalytics);

/**
 * Admin Course Management Routes
 */

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses for admin management
 * @access  Private (Admin only)
 */
router.get('/courses', auth, roleAuth(['admin']), courseController.getAllCourses);

/**
 * @route   POST /api/admin/courses
 * @desc    Create a new course
 * @access  Private (Admin only)
 */
router.post('/courses', auth, roleAuth(['admin']), courseController.createCourse);

/**
 * @route   PUT /api/admin/courses/:id
 * @desc    Update a course
 * @access  Private (Admin only)
 */
router.put('/courses/:id', auth, roleAuth(['admin']), courseController.update);

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete a course
 * @access  Private (Admin only)
 */
router.delete('/courses/:id', auth, roleAuth(['admin']), courseController.delete);

module.exports = router;
