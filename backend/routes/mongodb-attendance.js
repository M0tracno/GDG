// MongoDB attendance routes
const router = require('express').Router();
const { attendanceController } = require('../controllers/mongodb-controllers');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { attendanceValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records (with filters)
 * @access  Private (Admin, Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), attendanceController.getAll);

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (Admin, Faculty teaching the course, Student in the attendance record)
 */
router.get('/:id', auth, attendanceController.getById);

/**
 * @route   POST /api/attendance
 * @desc    Create a new attendance record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), attendanceValidation, attendanceController.create);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.put('/:id', auth, attendanceController.update);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), attendanceController.delete);

/**
 * @route   GET /api/attendance/student/:studentId/course/:courseId
 * @desc    Get attendance summary for a student in a specific course
 * @access  Private (Admin, Faculty teaching the course, Student themselves)
 */
router.get('/student/:studentId/course/:courseId', auth, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const result = await attendanceController.getStudentAttendanceSummary(
      studentId, 
      courseId,
      req.user.id,
      req.user.role
    );
    
    res.status(200).json({
      success: true,
      summary: result.summary,
      attendanceDetails: result.attendanceDetails
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
