// MongoDB faculty routes
const router = require('express').Router();
const { facultyController } = require('../controllers/mongodb-controllers');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { facultyValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/faculty
 * @desc    Get all faculty members
 * @access  Private (Admin or Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), facultyController.getAll);

/**
 * @route   GET /api/faculty/:id
 * @desc    Get faculty by ID
 * @access  Private (Admin, Faculty (self), or related Student)
 */
router.get('/:id', auth, facultyController.getById);

/**
 * @route   POST /api/faculty
 * @desc    Create new faculty
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), facultyValidation, facultyController.create);

/**
 * @route   PUT /api/faculty/:id
 * @desc    Update faculty profile
 * @access  Private (Admin or Self)
 */
router.put('/:id', auth, facultyValidation, facultyController.update);

/**
 * @route   DELETE /api/faculty/:id
 * @desc    Delete faculty
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), facultyController.delete);

/**
 * @route   GET /api/faculty/:id/courses
 * @desc    Get all courses taught by a faculty member
 * @access  Private (Admin, Faculty, or related Student)
 */
router.get('/:id/courses', auth, facultyController.getFacultyCourses);

/**
 * @route   GET /api/faculty/:id/quizzes
 * @desc    Get all quizzes created by a faculty member
 * @access  Private (Admin, Faculty, or related Student)
 */
router.get('/:id/quizzes', auth, async (req, res) => {
  try {
    // Import quiz management routes here to avoid circular dependencies
    const quizManagementRoutes = require('./quiz-management');
    
    // For now, return empty array as quiz functionality is in development
    res.status(200).json({
      success: true,
      count: 0,
      quizzes: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/auth/register/faculty
 * @desc    Register faculty account
 * @access  Public
 */
router.post('/register', facultyValidation, facultyController.register);

/**
 * @route   POST /api/auth/login/faculty
 * @desc    Login faculty account
 * @access  Public
 */
router.post('/login', facultyController.login);

// Profile picture upload route
router.post('/:id/profile-picture', 
  auth, 
  idParamValidation, 
  upload.single('profilePicture'), 
  async (req, res) => {
    try {
      // Upload handled by multer middleware
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Please upload a file' 
        });
      }
      
      const updatedFaculty = await facultyController.updateProfilePicture(
        req.params.id,
        `/uploads/profiles/${req.file.filename}`,
        req.user.id,
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        profilePictureUrl: updatedFaculty.profilePictureUrl
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
