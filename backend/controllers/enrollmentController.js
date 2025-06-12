const { Enrollment, Student, Course } = require('../models/mongodb-models');
const createBaseController = require('./baseController');

// Get base controller functions
const baseController = createBaseController(Enrollment);

/**
 * Create a new enrollment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createEnrollment = async (req, res, next) => {
  try {
    const { student, course } = req.body;
    
    // Check if student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if enrollment already exists
    const enrollmentExists = await Enrollment.findOne({ student, course });
    if (enrollmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }
    
    // Check if course is at capacity
    const enrollmentCount = await Enrollment.countDocuments({ course });
    if (enrollmentCount >= courseExists.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is already at maximum capacity'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update enrollment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Check if status is valid
    if (!['active', 'completed', 'withdrawn', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update enrollment grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateEnrollmentGrade = async (req, res, next) => {
  try {
    const { grade, finalScore } = req.body;
    
    // Check if grade is valid
    if (!['A', 'B', 'C', 'D', 'F', 'I', 'W', 'N/A'].includes(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid grade value'
      });
    }
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { 
        grade,
        finalScore: finalScore || null
      },
      { new: true, runValidators: true }
    );
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk enroll students in a course
 * @param {String} courseId - Course ID
 * @param {Array} studentIds - Array of student IDs
 * @param {String} status - Enrollment status
 * @returns {Object} - Enrollment results
 */
const bulkEnroll = async (courseId, studentIds, status = 'active') => {
  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Process enrollments
  const results = {
    created: 0,
    skipped: 0,
    enrollments: []
  };
  
  // Process each student
  for (const studentId of studentIds) {
    try {
      // Check if student exists
      const studentExists = await Student.findById(studentId);
      if (!studentExists) {
        continue;
      }
      
      // Check if enrollment already exists
      const enrollmentExists = await Enrollment.findOne({ 
        student: studentId, 
        course: courseId 
      });
      
      if (enrollmentExists) {
        results.skipped++;
        continue;
      }
      
      // Create new enrollment
      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        status: status,
        enrollmentDate: new Date(),
      });
      
      results.created++;
      results.enrollments.push(enrollment);
    } catch (error) {
      console.error(`Error enrolling student ${studentId}:`, error);
    }
  }
  
  return results;
};

module.exports = {
  ...baseController,
  createEnrollment,
  updateEnrollmentStatus,
  updateEnrollmentGrade,
  bulkEnroll
};
