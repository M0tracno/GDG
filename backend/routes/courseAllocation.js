const router = require('express').Router();
const config = require('../config/config');

// Use appropriate controller based on database type
const {
  getAllocatedCourses,
  assignFacultytoCourse,
  bulkAssignFaculty,
  bulkEnrollStudents,
  getAllocationStats
} = config.db.type === 'mongodb' 
  ? require('../controllers/courseAllocationController-mongodb')
  : require('../controllers/courseAllocationController');

const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/course-allocation/courses
 * @desc    Get all courses with allocation details
 * @access  Private (Admin)
 */
router.get('/courses', auth, roleAuth(['admin']), getAllocatedCourses);

/**
 * @route   POST /api/course-allocation/assign-faculty
 * @desc    Assign faculty to a course
 * @access  Private (Admin)
 */
router.post('/assign-faculty', auth, roleAuth(['admin']), assignFacultytoCourse);

/**
 * @route   POST /api/course-allocation/bulk-assign-faculty
 * @desc    Bulk assign faculty to multiple courses
 * @access  Private (Admin)
 */
router.post('/bulk-assign-faculty', auth, roleAuth(['admin']), bulkAssignFaculty);

/**
 * @route   POST /api/course-allocation/bulk-enroll-students
 * @desc    Bulk enroll students in courses
 * @access  Private (Admin)
 */
router.post('/bulk-enroll-students', auth, roleAuth(['admin']), bulkEnrollStudents);

/**
 * @route   GET /api/course-allocation/stats
 * @desc    Get allocation statistics
 * @access  Private (Admin)
 */
router.get('/stats', auth, roleAuth(['admin']), getAllocationStats);

module.exports = router;
