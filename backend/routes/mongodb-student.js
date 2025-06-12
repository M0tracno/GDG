// MongoDB student routes
const router = require('express').Router();
const { studentController } = require('../controllers/mongodb-controllers');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { studentValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/students
 * @desc    Get all students (paginated)
 * @access  Private (Admin or Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), studentController.getAll);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private (Admin, Faculty teaching the student, or Self)
 */
router.get('/:id', auth, studentController.getById);

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), studentValidation, studentController.create);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile
 * @access  Private (Admin or Self)
 */
router.put('/:id', auth, studentValidation, studentController.update);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), studentController.delete);

/**
 * @route   GET /api/students/:id/courses
 * @desc    Get all courses for a student
 * @access  Private (Admin, Faculty teaching the student, or Self)
 */
router.get('/:id/courses', auth, studentController.getStudentCourses);

/**
 * @route   POST /api/auth/register/student
 * @desc    Register student account
 * @access  Public
 */
router.post('/register', studentValidation, studentController.register);

/**
 * @route   POST /api/auth/login/student
 * @desc    Login student account 
 * @access  Public
 */
router.post('/login', studentController.login);

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
      
      const updatedStudent = await studentController.updateProfilePicture(
        req.params.id,
        `/uploads/profiles/${req.file.filename}`,
        req.user.id,
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        profilePictureUrl: updatedStudent.profilePictureUrl
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
