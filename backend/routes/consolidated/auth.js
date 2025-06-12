// Consolidated authentication routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const { loginValidation, registerValidation } = require('../../middleware/validation');
const { authLimiter } = require('../../middleware/rateLimit');
const config = require('../../config/config');

// Import models based on database type
let Faculty, Student, Op;

if (config.db.type === 'mongodb') {
  // MongoDB models
  const { Faculty: MongoFaculty, Student: MongoStudent } = require('../../models/mongodb-models');
  Faculty = MongoFaculty;
  Student = MongoStudent;
} else {
  // SQLite models
  const models = require('../../models');
  Faculty = models.Faculty;
  Student = models.Student;
  Op = models.Sequelize.Op;
}

/**
 * @route   POST /api/auth/register/faculty
 * @desc    Register a new faculty
 * @access  Public (or Admin in production)
 */
router.post('/register/faculty', registerValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName, employeeId, department } = req.body;

    let existingFaculty;
    
    // Check if faculty exists with this email or employeeId
    if (config.db.type === 'mongodb') {
      existingFaculty = await Faculty.findOne({ 
        $or: [{ email: email }, { employeeId: employeeId }] 
      });
    } else {
      existingFaculty = await Faculty.findOne({ 
        where: {
          [Op.or]: [
            { email: email },
            { employeeId: employeeId }
          ]
        }
      });
    }
    
    if (existingFaculty) {
      if (existingFaculty.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      } else {
        return res.status(400).json({ message: 'Employee ID already in use' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new faculty
    let faculty;
    if (config.db.type === 'mongodb') {
      faculty = await Faculty.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        department,
        ...req.body // Include any other fields from request body
      });
    } else {
      faculty = await Faculty.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        department,
        ...req.body // Include any other fields from request body
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: faculty.id || faculty._id, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: faculty.id || faculty._id,
        role: 'faculty',
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        employeeId: faculty.employeeId,
        department: faculty.department
      }
    });
  } catch (err) {
    console.error('Faculty registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/register/student
 * @desc    Register a new student
 * @access  Public (or Admin in production)
 */
router.post('/register/student', registerValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName, rollNumber, classId, section } = req.body;

    let existingStudent;
    
    // Check if student exists with this email or rollNumber
    if (config.db.type === 'mongodb') {
      existingStudent = await Student.findOne({ 
        $or: [{ email: email }, { rollNumber: rollNumber }] 
      });
    } else {
      existingStudent = await Student.findOne({ 
        where: {
          [Op.or]: [
            { email: email },
            { rollNumber: rollNumber }
          ]
        }
      });
    }
    
    if (existingStudent) {
      if (existingStudent.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      } else {
        return res.status(400).json({ message: 'Roll number already in use' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    let student;
    if (config.db.type === 'mongodb') {
      student = await Student.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        rollNumber,
        classId,
        section,
        ...req.body // Include any other fields from request body
      });
    } else {
      student = await Student.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        rollNumber,
        classId,
        section,
        ...req.body // Include any other fields from request body
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: student.id || student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );    // Return success response with token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: student.id || student._id,
        role: 'student',
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId || student.rollNumber, // Include studentId for MongoDB or rollNumber for SQLite
        rollNumber: student.rollNumber,
        classId: student.classId,
        section: student.section
      }
    });
  } catch (err) {
    console.error('Student registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user (faculty, student, admin)
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if password is provided
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    let user;
    let userRole = role;
    
    // If role is specified, check only that type of user
    if (role === 'faculty') {
      if (config.db.type === 'mongodb') {
        user = await Faculty.findOne({ email }).select('+password');
      } else {
        user = await Faculty.findOne({ where: { email } });
      }
    } else if (role === 'student') {
      if (config.db.type === 'mongodb') {
        user = await Student.findOne({ email }).select('+password');
      } else {
        user = await Student.findOne({ where: { email } });
      }    } else if (role === 'admin') {
      if (config.db.type === 'mongodb') {
        // Try to find admin user by either looking at role field or isAdmin field
        user = await Faculty.findOne({
          email,
          $or: [
            { role: 'admin' },
            { isAdmin: true }
          ]
        }).select('+password');
      } else {
        user = await Faculty.findOne({ where: { email, isAdmin: true } });
      }
      userRole = 'admin';
    } else {
      // If no role specified, check both faculty and student
      if (config.db.type === 'mongodb') {
        user = await Faculty.findOne({ email }).select('+password');
        userRole = 'faculty';
        
        if (!user) {
          user = await Student.findOne({ email }).select('+password');
          userRole = 'student';
        }
      } else {
        user = await Faculty.findOne({ where: { email } });
        userRole = 'faculty';
        
        if (!user) {
          user = await Student.findOne({ where: { email } });
          userRole = 'student';
        }
      }
    }
    
    // If no user found
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    let isMatch;
    if (config.db.type === 'mongodb') {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is active (if applicable)
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id || user._id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );    // Return success response with token
    res.json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        role: userRole,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(userRole === 'faculty' && { employeeId: user.employeeId, department: user.department }),
        ...(userRole === 'student' && { 
          studentId: user.studentId || user.rollNumber, // Include studentId for MongoDB or rollNumber for SQLite
          rollNumber: user.rollNumber, 
          classId: user.classId, 
          section: user.section 
        })
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    let user;
    
    // Get user based on role
    if (req.user.role === 'faculty' || req.user.role === 'admin') {
      if (config.db.type === 'mongodb') {
        user = await Faculty.findById(req.user.id);
      } else {
        user = await Faculty.findByPk(req.user.id);
      }
    } else if (req.user.role === 'student') {
      if (config.db.type === 'mongodb') {
        user = await Student.findById(req.user.id);
      } else {
        user = await Student.findByPk(req.user.id);
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
      res.json({
      success: true,
      user: {
        id: user.id || user._id,
        role: req.user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(req.user.role === 'faculty' && { 
          department: user.department,
          employeeId: user.employeeId,
          isAdmin: user.isAdmin
        }),
        ...(req.user.role === 'student' && {
          studentId: user.studentId || user.rollNumber, // Include studentId for MongoDB or rollNumber for SQLite
          rollNumber: user.rollNumber,
          classId: user.classId,
          section: user.section
        })
      }
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-firebase-email
 * @desc    Verify Firebase email authentication and create/authenticate user in backend
 * @access  Public
 */
router.post('/verify-firebase-email', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, emailVerified, role, ...additionalData } = req.body;

    // Validate input
    if (!firebaseUid || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID, email, and role are required'
      });
    }

    // Validate role
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Validate email verification for security
    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email must be verified to proceed'
      });
    }

    let user;
    let userRole = role;

    // Find or create user based on role
    if (role === 'faculty' || role === 'admin') {
      if (config.db.type === 'mongodb') {
        // Try to find existing faculty
        user = await Faculty.findOne({ email });
        
        if (!user) {
          // Create new faculty user
          user = await Faculty.create({
            email,
            firstName: additionalData.firstName || displayName?.split(' ')[0] || 'User',
            lastName: additionalData.lastName || displayName?.split(' ').slice(1).join(' ') || '',
            employeeId: additionalData.employeeId || `EMP${Date.now()}`,
            department: additionalData.department || 'General',
            firebaseUid,
            emailVerified: true,
            active: true,
            role: role === 'admin' ? 'admin' : 'faculty',
            isAdmin: role === 'admin',
            ...additionalData
          });
        } else {
          // Update existing user with Firebase UID if not set
          if (!user.firebaseUid) {
            user.firebaseUid = firebaseUid;
            user.emailVerified = true;
            await user.save();
          }
        }
      } else {
        // SQLite implementation
        user = await Faculty.findOne({ where: { email } });
        
        if (!user) {
          user = await Faculty.create({
            email,
            firstName: additionalData.firstName || displayName?.split(' ')[0] || 'User',
            lastName: additionalData.lastName || displayName?.split(' ').slice(1).join(' ') || '',
            employeeId: additionalData.employeeId || `EMP${Date.now()}`,
            department: additionalData.department || 'General',
            firebaseUid,
            emailVerified: true,
            isActive: true,
            isAdmin: role === 'admin',
            ...additionalData
          });
        }
      }
    } else if (role === 'student') {
      if (config.db.type === 'mongodb') {
        // Try to find existing student
        user = await Student.findOne({ email });
        
        if (!user) {
          // Create new student user
          user = await Student.create({
            email,
            firstName: additionalData.firstName || displayName?.split(' ')[0] || 'User',
            lastName: additionalData.lastName || displayName?.split(' ').slice(1).join(' ') || '',
            studentId: additionalData.studentId || `STU${Date.now()}`,
            rollNumber: additionalData.rollNumber || `ROLL${Date.now()}`,
            classId: additionalData.classId || 'General',
            section: additionalData.section || 'A',
            firebaseUid,
            emailVerified: true,
            active: true,
            ...additionalData
          });
        } else {
          // Update existing user with Firebase UID if not set
          if (!user.firebaseUid) {
            user.firebaseUid = firebaseUid;
            user.emailVerified = true;
            await user.save();
          }
        }
      } else {
        // SQLite implementation
        user = await Student.findOne({ where: { email } });
        
        if (!user) {
          user = await Student.create({
            email,
            firstName: additionalData.firstName || displayName?.split(' ')[0] || 'User',
            lastName: additionalData.lastName || displayName?.split(' ').slice(1).join(' ') || '',
            rollNumber: additionalData.rollNumber || `ROLL${Date.now()}`,
            classId: additionalData.classId || 'General',
            section: additionalData.section || 'A',
            firebaseUid,
            emailVerified: true,
            isActive: true,
            ...additionalData
          });
        }
      }
    }

    // Check if user is active
    const isUserActive = config.db.type === 'mongodb' ? 
      (user.active !== false) : 
      (user.isActive !== false);
    
    if (!isUserActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id || user._id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with token
    res.json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        role: userRole,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        firebaseUid: user.firebaseUid,
        emailVerified: user.emailVerified,
        ...(userRole === 'faculty' && { 
          employeeId: user.employeeId, 
          department: user.department,
          isAdmin: user.isAdmin
        }),
        ...(userRole === 'student' && { 
          studentId: user.studentId || user.rollNumber,
          rollNumber: user.rollNumber, 
          classId: user.classId, 
          section: user.section 
        })
      }
    });
  } catch (err) {
    console.error('Firebase email verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during Firebase email verification',
      error: err.message
    });
  }
});

// Add other auth routes as needed

module.exports = router;
