const { Student, Enrollment } = require('../models/mongodb-models');
const createBaseController = require('./baseController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Get base controller functions
const baseController = createBaseController(Student);

/**
 * Register a new student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { 
      firstName, lastName, email, password, 
      studentId, grade, dateOfBirth, 
      parentName, parentEmail, parentPhone 
    } = req.body;
    
    // Check if student already exists
    const studentExists = await Student.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    
    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or student ID already exists'
      });
    }
    
    // Create student
    const student = await Student.create({
      firstName,
      lastName,
      email,
      password,
      studentId,
      grade,
      dateOfBirth,
      parentName,
      parentEmail,
      parentPhone
    });
    
    // Generate token
    const token = jwt.sign(
      { id: student._id, role: 'student' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json({
      success: true,
      token,
      data: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId,
        grade: student.grade,
        role: 'student'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if student exists
    const student = await Student.findOne({ email }).select('+password');
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await student.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: student._id, role: 'student' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(200).json({
      success: true,
      token,
      data: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId,
        grade: student.grade,
        role: 'student'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student enrollments with course details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getStudentCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('course');
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile picture
 * @param {String} id - Student ID
 * @param {String} profilePicturePath - Path to profile picture
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Updated student
 */
const updateProfilePicture = async (id, profilePicturePath, userId, userRole) => {
  // Check if student exists
  const student = await Student.findById(id);
  
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Check permission - admin can update any student, student can update self
  const isAuthorized = userRole === 'admin' || 
                      (userRole === 'student' && userId === student._id.toString());
  
  if (!isAuthorized) {
    const error = new Error('Not authorized to update this student');
    error.statusCode = 403;
    throw error;
  }

  // Update profile picture URL
  student.profilePictureUrl = profilePicturePath;
  await student.save();
  
  return student;
};

module.exports = {
  ...baseController,
  register,
  login,
  getStudentCourses,
  updateProfilePicture
};
