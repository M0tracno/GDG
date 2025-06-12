// Consolidated attendance routes that work with both MongoDB and SQLite
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const config = require('../../config/config');

// Import the appropriate controllers based on database type
let attendanceController;
if (config.db.type === 'mongodb') {
  // Use the MongoDB implementation
  const { Attendance, Student, Course, Enrollment } = require('../../models/mongodb-models');
  
  // MongoDB implementation (from mongodb-attendance-fixed.js)
  attendanceController = {
    // Get all attendance records with filters
    getAll: async (req, res, next) => {
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
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          
          filter.date = { $gte: startDate, $lte: endDate };
        }
        
        if (status) {
          filter.status = status;
        }
        
        // For faculty, only show their courses
        if (req.user.role === 'faculty') {
          const facultyCourses = await Course.find({ faculty: req.user.id }).select('_id');
          const courseEnrollments = await Enrollment.find({ 
            course: { $in: facultyCourses.map(c => c._id) } 
          }).select('_id');
          
          filter.enrollment = filter.enrollment 
            ? { $in: filter.enrollment.$in.filter(id => courseEnrollments.some(e => e._id.equals(id))) }
            : { $in: courseEnrollments.map(e => e._id) };
        }
        
        // Execute query with populated fields
        const attendanceRecords = await Attendance.find(filter)
          .populate({
            path: 'enrollment',
            populate: [
              { path: 'student', select: 'firstName lastName email studentId' },
              { path: 'course', select: 'title code' }
            ]
          })
          .sort({ date: -1 });
        
        res.json({ success: true, data: attendanceRecords });
      } catch (error) {
        next(error);
      }
    },
    
    // Get attendance record by ID
    getById: async (req, res, next) => {
      try {
        const attendance = await Attendance.findById(req.params.id)
          .populate({
            path: 'enrollment',
            populate: [
              { path: 'student', select: 'firstName lastName email studentId' },
              { path: 'course', select: 'title code faculty' }
            ]
          });
        
        if (!attendance) {
          return res.status(404).json({ 
            success: false, 
            message: 'Attendance record not found' 
          });
        }
        
        // Check permissions
        if (req.user.role === 'student') {
          // Students can only view their own attendance
          if (!attendance.enrollment.student._id.equals(req.user.id)) {
            return res.status(403).json({
              success: false,
              message: 'Access denied'
            });
          }
        } else if (req.user.role === 'faculty') {
          // Faculty can only view attendance for their courses
          if (!attendance.enrollment.course.faculty.equals(req.user.id)) {
            return res.status(403).json({
              success: false,
              message: 'Access denied'
            });
          }
        }
        
        res.json({ success: true, data: attendance });
      } catch (error) {
        next(error);
      }
    },
    
    // Create new attendance record
    create: async (req, res, next) => {
      try {
        const { enrollmentId, date, status, comments } = req.body;
        
        // Validate enrollment
        const enrollment = await Enrollment.findById(enrollmentId)
          .populate('course', 'faculty');
        
        if (!enrollment) {
          return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
          });
        }
        
        // Check if user has permission (admin or faculty teaching the course)
        if (req.user.role === 'faculty' && !enrollment.course.faculty.equals(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to mark attendance for this course'
          });
        }
        
        // Check for existing attendance on this date for this enrollment
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        const existingAttendance = await Attendance.findOne({
          enrollment: enrollmentId,
          date: { $gte: startDate, $lte: endDate }
        });
        
        if (existingAttendance) {
          return res.status(400).json({
            success: false,
            message: 'Attendance already recorded for this date'
          });
        }
        
        // Create attendance record
        const attendance = await Attendance.create({
          enrollment: enrollmentId,
          date: date || new Date(),
          status,
          comments
        });
        
        // Return with populated fields
        const populatedAttendance = await Attendance.findById(attendance._id)
          .populate({
            path: 'enrollment',
            populate: [
              { path: 'student', select: 'firstName lastName email studentId' },
              { path: 'course', select: 'title code' }
            ]
          });
        
        res.status(201).json({
          success: true,
          data: populatedAttendance
        });
      } catch (error) {
        next(error);
      }
    },
    
    // Update attendance record
    update: async (req, res, next) => {
      try {
        const { status, comments } = req.body;
        
        // Find attendance record
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
        
        // Check permissions
        if (req.user.role === 'faculty' && !attendance.enrollment.course.faculty.equals(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to update this attendance record'
          });
        }
        
        // Update fields
        if (status) attendance.status = status;
        if (comments !== undefined) attendance.comments = comments;
        
        await attendance.save();
        
        // Return with populated fields
        const updatedAttendance = await Attendance.findById(attendance._id)
          .populate({
            path: 'enrollment',
            populate: [
              { path: 'student', select: 'firstName lastName email studentId' },
              { path: 'course', select: 'title code' }
            ]
          });
          
        res.json({
          success: true,
          data: updatedAttendance
        });
      } catch (error) {
        next(error);
      }
    },
    
    // Delete attendance record
    delete: async (req, res, next) => {
      try {
        // Find attendance record
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
        
        // Only admin or faculty teaching the course can delete
        if (req.user.role === 'faculty' && !attendance.enrollment.course.faculty.equals(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to delete this attendance record'
          });
        }
        
        await Attendance.findByIdAndDelete(req.params.id);
        
        res.json({
          success: true,
          message: 'Attendance record deleted successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  };
} else {
  // Use the SQLite implementation
  attendanceController = require('../../controllers/attendanceController');
}

// Define routes
router.get('/', auth, roleAuth(['admin', 'faculty']), attendanceController.getAll);
router.get('/:id', auth, attendanceController.getById);
router.post('/', auth, roleAuth(['admin', 'faculty']), attendanceController.create);
router.put('/:id', auth, roleAuth(['admin', 'faculty']), attendanceController.update);
router.delete('/:id', auth, roleAuth(['admin', 'faculty']), attendanceController.delete);

module.exports = router;
