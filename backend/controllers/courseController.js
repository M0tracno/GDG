const { Course, Enrollment, Faculty } = require('../models/mongodb-models');
const createBaseController = require('./baseController');

// Get base controller functions
const baseController = createBaseController(Course);

/**
 * Create a new course
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createCourse = async (req, res, next) => {
  try {
    // Check if faculty exists
    const faculty = await Faculty.findById(req.body.faculty);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    // Create course
    const course = await Course.create(req.body);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses with faculty details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('faculty', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID with faculty details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students enrolled in a course
 * @param {String} courseId - Course ID
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Students enrolled in the course
 */
const getCourseStudents = async (courseId, userId, userRole) => {
  // Check if course exists
  const course = await Course.findById(courseId);
  
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Check permission
  const isAuthorized = userRole === 'admin' || 
                      (userRole === 'faculty' && course.faculty.toString() === userId);
  
  if (!isAuthorized) {
    const error = new Error('Not authorized to view students for this course');
    error.statusCode = 403;
    throw error;
  }

  // Get enrollments and populate student details
  const enrollments = await Enrollment.find({
    course: course._id,
    status: { $in: ['active', 'completed'] }
  }).populate('student', 'firstName lastName rollNumber email classId section');

  const students = enrollments.map(enrollment => ({
    enrollment: {
      id: enrollment._id,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate,
      grade: enrollment.grade
    },
    student: enrollment.student
  }));

  return { course, students };
};

/**
 * Upload course material
 * @param {String} courseId - Course ID
 * @param {Object} materialData - Material data
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Updated course with new material
 */
const uploadCourseMaterial = async (courseId, materialData, userId, userRole) => {
  // Check if course exists
  const course = await Course.findById(courseId);
  
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Check permission
  const isAuthorized = userRole === 'admin' || 
                      (userRole === 'faculty' && course.faculty.toString() === userId);
  
  if (!isAuthorized) {
    const error = new Error('Not authorized to upload materials for this course');
    error.statusCode = 403;
    throw error;
  }

  // Create new material
  const newMaterial = {
    ...materialData,
    uploadedAt: new Date()
  };

  // Add material to course
  course.materials = course.materials || [];
  course.materials.push(newMaterial);
  await course.save();

  return { course, material: newMaterial };
};

module.exports = {
  ...baseController,
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseStudents,
  uploadCourseMaterial
};
