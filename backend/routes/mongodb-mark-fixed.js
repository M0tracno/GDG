// MongoDB mark routes
const express = require('express');
const router = express.Router();
const { Mark, Student, Course, Enrollment } = require('../models/mongodb-models');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/marks
 * @desc    Get all marks (with filters)
 * @access  Private (Admin, Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    // Get filter parameters
    const { courseId, studentId, examName } = req.query;
    const filter = {};
    
    // Build filter
    if (courseId) {
      const enrollments = await Enrollment.find({ course: courseId }).select('_id');
      filter.enrollment = { $in: enrollments.map(e => e._id) };
    }
    
    if (studentId) {
      const studentEnrollments = await Enrollment.find({ student: studentId }).select('_id');
      filter.enrollment = filter.enrollment 
        ? { $in: filter.enrollment.$in.filter(id => studentEnrollments.some(e => e._id.equals(id))) }
        : { $in: studentEnrollments.map(e => e._id) };
    }
    
    if (examName) {
      filter.examName = { $regex: examName, $options: 'i' };
    }
    
    // Get marks with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const marks = await Mark.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'firstName lastName studentId' },
          { path: 'course', select: 'name code' }
        ]
      })
      .sort({ examDate: -1 });
    
    const total = await Mark.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: marks.length,
      total,
      pages: Math.ceil(total / limit),
      data: marks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/marks/:id
 * @desc    Get mark by ID
 * @access  Private (Admin, Faculty teaching the course, Student who earned the mark)
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'firstName lastName studentId' },
          { path: 'course', select: 'name code faculty' }
        ]
      });
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }
    
    // Check if user is authorized
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const isAuthorized = 
      userRole === 'admin' || 
      (userRole === 'faculty' && mark.enrollment.course.faculty.equals(userId)) ||
      (userRole === 'student' && mark.enrollment.student._id.equals(userId));
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this mark'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mark
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/marks
 * @desc    Create a new mark
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const { enrollment, examName, marks, maximumMarks, examDate, comments } = req.body;
    
    // Check if enrollment exists
    const enrollmentDoc = await Enrollment.findById(enrollment)
      .populate('course', 'faculty');
    
    if (!enrollmentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if user is authorized (admin or faculty teaching the course)
    const userRole = req.user.role;
    const userId = req.user.id;
    
    if (userRole === 'faculty' && !enrollmentDoc.course.faculty.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add marks for this course'
      });
    }
    
    // Create mark
    const mark = await Mark.create({
      enrollment,
      examName,
      marks,
      maximumMarks,
      examDate: examDate || new Date(),
      comments
    });
    
    res.status(201).json({
      success: true,
      data: mark
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/marks/:id
 * @desc    Update mark
 * @access  Private (Admin, Faculty teaching the course)
 */
router.put('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'faculty' }
      });
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }
    
    // Check if user is authorized
    const userRole = req.user.role;
    const userId = req.user.id;
    
    if (userRole === 'faculty' && !mark.enrollment.course.faculty.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update marks for this course'
      });
    }
    
    // Update fields
    if (req.body.examName) mark.examName = req.body.examName;
    if (req.body.marks !== undefined) mark.marks = req.body.marks;
    if (req.body.maximumMarks !== undefined) mark.maximumMarks = req.body.maximumMarks;
    if (req.body.examDate) mark.examDate = req.body.examDate;
    if (req.body.comments !== undefined) mark.comments = req.body.comments;
    
    // Save changes
    await mark.save();
    
    res.status(200).json({
      success: true,
      data: mark
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/marks/:id
 * @desc    Delete mark
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id);
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }
    
    await mark.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Mark deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/marks/bulk
 * @desc    Add bulk marks for students
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/bulk', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const { courseId, examName, maximumMarks, examDate, records } = req.body;
    
    if (!courseId || !examName || !maximumMarks || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
    
    // Check if course exists and user is authorized
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // For faculty, check if they teach this course
    const userRole = req.user.role;
    const userId = req.user.id;
    
    if (userRole === 'faculty' && !course.faculty.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add marks for this course'
      });
    }
    
    // Get all enrollments for the course
    const enrollments = await Enrollment.find({ course: courseId });
    
    // Create mark records
    const markDate = examDate ? new Date(examDate) : new Date();
    const results = {
      created: 0,
      failed: 0,
      marks: []
    };
    
    for (const record of records) {
      try {
        // Find the enrollment
        const enrollment = enrollments.find(e => 
          e.student.toString() === record.studentId
        );
        
        if (!enrollment) {
          results.failed++;
          continue;
        }
        
        // Create mark record
        const mark = await Mark.create({
          enrollment: enrollment._id,
          examName,
          marks: record.marks,
          maximumMarks,
          examDate: markDate,
          comments: record.comments
        });
        
        results.created++;
        results.marks.push(mark);
      } catch (error) {
        results.failed++;
        console.error(`Error creating mark record: ${error.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `${results.created} mark records created, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
