// MongoDB mark routes
const router = require('express').Router();
const markController = require('../controllers/markController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { markValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/marks
 * @desc    Get marks/assessments (with filters)
 * @access  Private (Admin, Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), markController.getAll);

/**
 * @route   GET /api/marks/:id
 * @desc    Get mark record by ID
 * @access  Private (Admin, Faculty teaching the course, Student in the record)
 */
router.get('/:id', auth, markController.getById);

/**
 * @route   POST /api/marks
 * @desc    Create a new mark record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), markValidation, markController.create);

/**
 * @route   PUT /api/marks/:id
 * @desc    Update mark record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.put('/:id', auth, markController.update);

/**
 * @route   DELETE /api/marks/:id
 * @desc    Delete mark record
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), markController.delete);

/**
 * @route   GET /api/marks/student/:studentId/course/:courseId
 * @desc    Get marks summary for a student in a specific course
 * @access  Private (Admin, Faculty teaching the course, Student themselves)
 */
router.get('/student/:studentId/course/:courseId', auth, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const result = await markController.getStudentMarksSummary(
      studentId, 
      courseId,
      req.user.id,
      req.user.role
    );
    
    res.status(200).json({
      success: true,
      summary: result.summary,
      markDetails: result.markDetails
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
