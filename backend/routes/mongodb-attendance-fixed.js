// MongoDB attendance routes
const express = require('express');
const router = express.Router();
const { Attendance, Student, Course, Enrollment } = require('../models/mongodb-models');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records (with filters)
 * @access  Private (Admin, Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    // Get filter parameters
    const { courseId, studentId, date, status } = req.query;
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
    
    if (date) {
      // Handle date range or specific date
      const dateObj = new Date(date);
      filter.date = { $gte: dateObj, $lt: new Date(dateObj.getTime() + 24*60*60*1000) };
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Get attendance records with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'firstName lastName studentId' },
          { path: 'course', select: 'name code' }
        ]
      })
      .sort({ date: -1 });
    
    const total = await Attendance.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      pages: Math.ceil(total / limit),
      data: attendance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (Admin, Faculty teaching the course, Student in the attendance record)
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'firstName lastName studentId' },
          { path: 'course', select: 'name code faculty' }
        ]
      });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/attendance
 * @desc    Create a new attendance record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const { enrollment, date, status, comments } = req.body;
    
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
        message: 'You are not authorized to mark attendance for this course'
      });
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      enrollment,
      date: date || new Date(),
      status,
      comments
    });
    
    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.put('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'faculty' }
      });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check if user is authorized
    const userRole = req.user.role;
    const userId = req.user.id;
    
    if (userRole === 'faculty' && !attendance.enrollment.course.faculty.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update attendance for this course'
      });
    }
    
    // Update fields
    if (req.body.status) attendance.status = req.body.status;
    if (req.body.comments !== undefined) attendance.comments = req.body.comments;
    
    // Save changes
    await attendance.save();
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    await attendance.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/attendance/bulk
 * @desc    Create bulk attendance records
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/bulk', auth, roleAuth(['admin', 'faculty']), async (req, res, next) => {
  try {
    const { courseId, records, date } = req.body;
    
    if (!courseId || !records || !Array.isArray(records)) {
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
        message: 'You are not authorized to mark attendance for this course'
      });
    }
    
    // Get all enrollments for the course
    const enrollments = await Enrollment.find({ course: courseId });
    
    // Create attendance records
    const attendanceDate = date ? new Date(date) : new Date();
    const results = {
      created: 0,
      failed: 0,
      records: []
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
        
        // Create attendance record
        const attendance = await Attendance.create({
          enrollment: enrollment._id,
          date: attendanceDate,
          status: record.status,
          comments: record.comments
        });
        
        results.created++;
        results.records.push(attendance);
      } catch (error) {
        results.failed++;
        console.error(`Error creating attendance record: ${error.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `${results.created} attendance records created, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
