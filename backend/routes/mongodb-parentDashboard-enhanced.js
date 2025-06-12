const express = require('express');
const parentDashboardController = require('../controllers/mongodb-parentDashboardController');
const { parentAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Enhanced Parent Dashboard Routes
 * All routes for parent dashboard functionality with proper authentication
 */

// Get parent profile
router.get('/profile', parentAuth, parentDashboardController.getParentProfile);

// Get parent's children
router.get('/children', parentAuth, parentDashboardController.getChildren);

// Get all grades for all children
router.get('/grades', parentAuth, parentDashboardController.getAllChildrenGrades);

// Get child grades by student ID
router.get('/grades/:studentId', parentAuth, parentDashboardController.getChildGrades);

// Get all assignments for all children
router.get('/assignments', parentAuth, parentDashboardController.getAllChildrenAssignments);

// Get child assignments by student ID
router.get('/assignments/:studentId', parentAuth, parentDashboardController.getChildAssignments);

// Get all attendance for all children
router.get('/attendance', parentAuth, parentDashboardController.getAllChildrenAttendance);

// Get child attendance by student ID
router.get('/attendance/:studentId', parentAuth, parentDashboardController.getChildAttendance);

// Get teacher feedback for all children
router.get('/feedback', parentAuth, parentDashboardController.getAllChildrenFeedback);

// Get child feedback by student ID
router.get('/feedback/:studentId', parentAuth, parentDashboardController.getChildFeedback);

// Get upcoming events
router.get('/events', parentAuth, parentDashboardController.getEvents);

// Get dashboard summary statistics
router.get('/dashboard-summary', parentAuth, parentDashboardController.getDashboardSummary);

// Get child dashboard summary by student ID
router.get('/dashboard/:studentId', parentAuth, parentDashboardController.getChildDashboard);

// Send message to teacher
router.post('/messages', parentAuth, parentDashboardController.sendMessage);

// Get messages/communications
router.get('/messages', parentAuth, parentDashboardController.getMessages);

// Schedule meeting with teacher
router.post('/meetings', parentAuth, parentDashboardController.scheduleMeeting);

// Get scheduled meetings
router.get('/meetings', parentAuth, parentDashboardController.getMeetings);

module.exports = router;
