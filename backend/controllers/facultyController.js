const { Faculty } = require('../models/mongodb-models');
const createBaseController = require('./baseController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Get base controller functions
const baseController = createBaseController(Faculty);

/**
 * Register a new faculty
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, employeeId, department, title } = req.body;
    
    // Check if faculty already exists
    const facultyExists = await Faculty.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (facultyExists) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this email or employee ID already exists'
      });
    }
    
    // Create faculty
    const faculty = await Faculty.create({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      department,
      title: title || 'Instructor'
    });
    
    // Generate token
    const token = jwt.sign(
      { id: faculty._id, role: 'faculty' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json({
      success: true,
      token,
      data: {
        _id: faculty._id,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        employeeId: faculty.employeeId,
        department: faculty.department,
        role: 'faculty'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login faculty
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if faculty exists
    const faculty = await Faculty.findOne({ email }).select('+password');
    
    if (!faculty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await faculty.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: faculty._id, role: 'faculty' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(200).json({
      success: true,
      token,
      data: {
        _id: faculty._id,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        employeeId: faculty.employeeId,
        department: faculty.department,
        role: 'faculty'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get faculty courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFacultyCourses = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('courses');
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: faculty.courses.length,
      data: faculty.courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update faculty profile picture
 * @param {String} id - Faculty ID
 * @param {String} profilePicturePath - Path to profile picture
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Updated faculty
 */
const updateProfilePicture = async (id, profilePicturePath, userId, userRole) => {
  // Check if faculty exists
  const faculty = await Faculty.findById(id);
  
  if (!faculty) {
    const error = new Error('Faculty not found');
    error.statusCode = 404;
    throw error;
  }

  // Check permission - admin can update any faculty, faculty can update self
  const isAuthorized = userRole === 'admin' || 
                      (userRole === 'faculty' && userId === faculty._id.toString());
  
  if (!isAuthorized) {
    const error = new Error('Not authorized to update this faculty');
    error.statusCode = 403;
    throw error;
  }

  // Update profile picture URL
  faculty.profilePictureUrl = profilePicturePath;
  await faculty.save();
  
  return faculty;
};

module.exports = {
  ...baseController,
  register,
  login,
  getFacultyCourses,
  updateProfilePicture
};
