// MongoDB enrollment routes - Fixed version
const express = require('express');
const router = express.Router();
const { Enrollment, Student, Course } = require('../models/mongodb-models');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (paginated)
 * @access  Private (Admin or Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'name code');
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private (Admin, Faculty of the course, or Student enrolled)
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'name code faculty');
    
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
});

/**
 * @route   POST /api/enrollments
 * @desc    Create new enrollment
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), async (req, res, next) => {
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
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      student,
      course,
      enrollmentDate: new Date(),
      status: req.body.status || 'active'
    });
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/enrollments/:id
 * @desc    Update enrollment status or grade
 * @access  Private (Admin or Faculty of the course)
 */
router.put('/:id', auth, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Update fields
    if (req.body.status) {
      enrollment.status = req.body.status;
    }
    
    if (req.body.finalGrade !== undefined) {
      enrollment.finalGrade = req.body.finalGrade;
    }
    
    // Save changes
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Delete enrollment
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    await enrollment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/enrollments/bulk
 * @desc    Bulk enroll students in a course
 * @access  Private (Admin only)
 */
router.post('/bulk', auth, roleAuth(['admin']), async (req, res, next) => {
  try {
    // Validate request
    if (!req.body.courseId || !req.body.studentIds || !Array.isArray(req.body.studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
    
    const courseId = req.body.courseId;
    const studentIds = req.body.studentIds;
    const status = req.body.status || 'active';
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Track results
    const results = {
      created: 0,
      skipped: 0,
      enrollments: []
    };
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
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
    
    res.status(200).json({
      success: true,
      message: `${results.created} students enrolled, ${results.skipped} skipped (already enrolled)`,
      enrollments: results.enrollments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
