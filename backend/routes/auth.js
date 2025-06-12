const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimit');
const { sendOTP, verifyOTP } = require('../controllers/parentAuthController');

/**
 * @swagger
 * /api/auth/register/faculty:
 *   post:
 *     summary: Register a new faculty member
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - employeeId
 *               - department
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Faculty registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Email or Employee ID already in use
 *       500:
 *         description: Server error
 */
router.post('/register/faculty', registerValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName, employeeId, department } = req.body;

    // Check if faculty exists with this email or employeeId
    const existingFaculty = await Faculty.findOne({ 
      where: {
        [Op.or]: [
          { email: email },
          { employeeId: employeeId }
        ]
      }
    });
    
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
    const faculty = await Faculty.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      employeeId,
      department,
      ...req.body // Include any other fields from request body
    });

    // Create JWT token
    const token = jwt.sign(
      { id: faculty.id, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: faculty.id,
        role: 'faculty',
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email
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
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     summary: Register a new student
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - rollNumber
 *               - classId
 *               - section
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               classId:
 *                 type: string
 *               section:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Email or Roll number already in use
 *       500:
 *         description: Server error
 */
router.post('/register/student', registerValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName, rollNumber, classId, section } = req.body;

    // Check if student exists with this email or rollNumber
    const existingStudent = await Student.findOne({ 
      where: {
        [Op.or]: [
          { email: email },
          { rollNumber: rollNumber }
        ]
      }
    });
    
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
    const student = await Student.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      rollNumber,
      classId,
      section,
      ...req.body // Include any other fields from request body
    });

    // Create JWT token
    const token = jwt.sign(
      { id: student.id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: student.id,
        role: 'student',
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
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
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid email or password
 *       401:
 *         description: Account deactivated
 *       500:
 *         description: Server error
 */
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if password is provided
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check if we're using MongoDB or SQLite
    const dbType = process.env.DB_TYPE || 'mongodb';
    
    let user = null;
    let role = null;
    let isMatch = false;
    
    if (dbType === 'mongodb') {
      // MongoDB authentication - import models from MongoDB
      const { Faculty: MongoFaculty, Student: MongoStudent } = require('../models/mongodb-models');
      
      console.log('MongoDB login attempt for email:', email);
      
      // Check if user is a faculty member
      let faculty = await MongoFaculty.findOne({ email }).select('+password');
      if (faculty) {
        console.log('Found faculty user:', faculty.firstName, faculty.lastName);
        user = faculty;
        role = 'faculty';
        isMatch = await faculty.matchPassword(password);
        console.log('Faculty password match result:', isMatch);
      }
      
      // If not faculty, check if user is a student
      if (!user) {
        let student = await MongoStudent.findOne({ email }).select('+password');
        if (student) {
          console.log('Found student user:', student.firstName, student.lastName);
          user = student;
          role = 'student';
          isMatch = await student.matchPassword(password);
          console.log('Student password match result:', isMatch);
        }
      }
    } else {
      // SQLite authentication
      // Check if user is a faculty member
      user = await Faculty.findOne({ where: { email } });
      role = 'faculty';
      
      // If not faculty, check if user is a student
      if (!user) {
        user = await Student.findOne({ where: { email } });
        role = 'student';
      }
      
      // Validate password for SQLite
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }
    
    // If no user found with this email
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Password validation result is now stored in isMatch
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If user is not active - different field names between MongoDB and SQLite
    const isUserActive = dbType === 'mongodb' ? 
      (user.active !== false) : 
      (user.isActive !== false);
    
    if (!isUserActive) {
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    // Create JWT token - MongoDB uses _id, SQLite uses id
    const userId = dbType === 'mongodb' ? user._id : user.id;
    
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with token
    res.json({
      success: true,
      token,
      user: {
        id: userId,
        role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // Include role-specific fields
        ...(role === 'faculty' ? { 
          employeeId: user.employeeId 
        } : {}),
        ...(role === 'student' ? {
          studentId: user.studentId || user.rollNumber // Include studentId for MongoDB or rollNumber for SQLite
        } : {})
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
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Check which database type we're using
    const dbType = process.env.DB_TYPE || 'mongodb';
    let user;
    
    if (dbType === 'mongodb') {
      // MongoDB authentication - import models from MongoDB
      const { Faculty: MongoFaculty, Student: MongoStudent } = require('../models/mongodb-models');
      
      // Get user based on role using MongoDB models
      if (req.user.role === 'faculty') {
        user = await MongoFaculty.findById(req.user.id);
      } else if (req.user.role === 'student') {
        user = await MongoStudent.findById(req.user.id);
      }
    } else {
      // SQLite authentication
      // Get user based on role using Sequelize models
      if (req.user.role === 'faculty') {
        user = await Faculty.findByPk(req.user.id);
      } else if (req.user.role === 'student') {
        user = await Student.findByPk(req.user.id);
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the user ID based on database type
    const userId = dbType === 'mongodb' ? user._id : user.id;
    
    res.json({
      success: true,
      user: {
        id: userId,
        role: req.user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // Include other user details as needed
        ...(req.user.role === 'faculty' ? { 
          department: user.department,
          position: user.position || user.title, // MongoDB uses title, SQLite uses position
          employeeId: user.employeeId
        } : {}),
        ...(req.user.role === 'student' ? {
          studentId: user.studentId || user.rollNumber, // MongoDB uses studentId, SQLite uses rollNumber
          grade: user.grade || user.classId, // MongoDB uses grade, SQLite uses classId
          section: user.section
        } : {})
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
 * @swagger
 * /api/auth/parent/send-otp:
 *   post:
 *     summary: Send OTP to parent's phone number for authentication
 *     tags: [Parent Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - studentId
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Parent's phone number (10 digits)
 *                 pattern: '^[0-9]{10}$'
 *               studentId:
 *                 type: string
 *                 description: Student's 5-digit ID
 *                 pattern: '^[0-9]{5}$'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otpId:
 *                   type: string
 *       400:
 *         description: Invalid phone number or student ID
 *       429:
 *         description: Too many OTP requests
 *       500:
 *         description: Server error
 */
router.post('/parent/send-otp', authLimiter, sendOTP);

/**
 * @swagger
 * /api/auth/parent/verify-otp:
 *   post:
 *     summary: Verify OTP and authenticate parent
 *     tags: [Parent Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *               - otpId
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Parent's phone number (10 digits)
 *                 pattern: '^[0-9]{10}$'
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code
 *                 pattern: '^[0-9]{6}$'
 *               otpId:
 *                 type: string
 *                 description: OTP ID received from send-otp endpoint
 *     responses:
 *       200:
 *         description: OTP verified successfully, parent authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 parent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
router.post('/parent/verify-otp', authLimiter, verifyOTP);

module.exports = router;