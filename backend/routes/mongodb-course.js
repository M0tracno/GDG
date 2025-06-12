// MongoDB course routes
const router = require('express').Router();
const { courseController } = require('../controllers/mongodb-controllers');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { courseValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/courses
 * @desc    Get all courses (paginated)
 * @access  Private (Any authenticated user)
 */
router.get('/', auth, courseController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Private (Any authenticated user with access to the course)
 */
router.get('/:id', auth, courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), courseValidation, courseController.createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Admin or Faculty teaching the course)
 */
router.put('/:id', auth, courseController.update);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), courseController.delete);

/**
 * @route   GET /api/courses/:id/students
 * @desc    Get all students enrolled in a course
 * @access  Private (Admin or assigned Faculty)
 */
router.get('/:id/students', auth, async (req, res) => {
  try {
    const result = await courseController.getCourseStudents(
      req.params.id,
      req.user.id,
      req.user.role
    );
    
    res.status(200).json({
      success: true,
      count: result.students.length,
      students: result.students
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/courses/:id/materials
 * @desc    Upload course material
 * @access  Private (Admin or Faculty teaching the course)
 */
router.post(
  '/:id/materials',
  auth,
  idParamValidation,
  upload.single('material'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Please upload a file' 
        });
      }
      
      const result = await courseController.uploadCourseMaterial(
        req.params.id,
        {
          title: req.body.title || req.file.originalname,
          description: req.body.description || '',
          filePath: `/uploads/course-materials/${req.file.filename}`,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          uploadedBy: req.user.id
        },
        req.user.id,
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        message: 'Course material uploaded successfully',
        material: result.material
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
