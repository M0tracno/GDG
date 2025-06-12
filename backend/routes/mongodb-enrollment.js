// MongoDB enrollment routes
const router = require('express').Router();
const { enrollmentController } = require('../controllers/mongodb-controllers');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { enrollmentValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (paginated)
 * @access  Private (Admin or Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), enrollmentController.getAll);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private (Admin, Faculty of the course, or Student enrolled)
 */
router.get('/:id', auth, enrollmentController.getById);

/**
 * @route   POST /api/enrollments
 * @desc    Create new enrollment
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), enrollmentValidation, enrollmentController.create);

/**
 * @route   PUT /api/enrollments/:id
 * @desc    Update enrollment status or grade
 * @access  Private (Admin or Faculty of the course)
 */
router.put('/:id', auth, enrollmentController.update);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Delete enrollment
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), enrollmentController.delete);

/**
 * @route   POST /api/enrollments/bulk
 * @desc    Bulk enroll students in a course
 * @access  Private (Admin only)
 */
router.post('/bulk', auth, roleAuth(['admin']), async (req, res) => {
  try {
    // Validate request
    if (!req.body.courseId || !req.body.studentIds || !Array.isArray(req.body.studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    const result = await enrollmentController.bulkEnroll(
      req.body.courseId,
      req.body.studentIds,
      req.body.status || 'active'
    );
    
    res.status(200).json({
      success: true,
      message: `${result.created} students enrolled, ${result.skipped} skipped (already enrolled)`,
      enrollments: result.enrollments
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
