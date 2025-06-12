const express = require('express');
const parentDashboardController = require('../controllers/mongodb-parentDashboardController');
const { parentAuth } = require('../middleware/auth');

const router = express.Router();

// Get parent's children
router.get('/children', parentAuth, parentDashboardController.getChildren);

// Get child grades
router.get('/grades/:studentId', parentAuth, parentDashboardController.getChildGrades);

// Get child feedback
router.get('/feedback/:studentId', parentAuth, parentDashboardController.getChildFeedback);

// Get child attendance
router.get('/attendance/:studentId', parentAuth, parentDashboardController.getChildAttendance);

// Get child assignments
router.get('/assignments/:studentId', parentAuth, parentDashboardController.getChildAssignments);

// Get child dashboard summary
router.get('/dashboard/:studentId', parentAuth, parentDashboardController.getChildDashboard);

// Get events
router.get('/events', parentAuth, parentDashboardController.getEvents);

module.exports = router;
