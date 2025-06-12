const { Attendance, Course, Enrollment, Student } = require('../models/mongodb-models');
const createBaseController = require('./baseController');

// Get base controller functions
const baseController = createBaseController(Attendance);

/**
 * Create attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const create = async (req, res, next) => {
  try {
    const { course, date, records, topic, notes } = req.body;
    
    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check permission for faculty
    if (req.user.role === 'faculty' && courseExists.faculty.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create attendance for this course'
      });
    }
    
    // Check if attendance record already exists
    const existingAttendance = await Attendance.findOne({
      course,
      date: new Date(date)
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      course,
      date: new Date(date),
      markedBy: req.user.id,
      topic,
      notes,
      records: records || []
    });
    
    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('course')
      .populate('markedBy', 'firstName lastName')
      .populate('records.student', 'firstName lastName rollNumber');
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check permission
    const isAdmin = req.user.role === 'admin';
    
    // Check if faculty is teaching this course
    const isFaculty = req.user.role === 'faculty' && 
                     attendance.course && 
                     attendance.course.faculty && 
                     attendance.course.faculty.toString() === req.user.id;
    
    // If student, check if they are in this record
    let isStudent = false;
    if (req.user.role === 'student') {
      const studentRecord = attendance.records.find(
        record => record.student && record.student._id.toString() === req.user.id
      );
      isStudent = !!studentRecord;
      
      // If student is enrolled, filter the records to only show their own
      if (isStudent) {
        const filteredAttendance = JSON.parse(JSON.stringify(attendance));
        filteredAttendance.records = attendance.records.filter(
          record => record.student && record.student._id.toString() === req.user.id
        );
        
        return res.status(200).json({
          success: true,
          data: filteredAttendance
        });
      }
    }
    
    if (!isAdmin && !isFaculty && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attendance record'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const update = async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id).populate('course');
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isFaculty = req.user.role === 'faculty' && 
                     attendance.course && 
                     attendance.course.faculty && 
                     attendance.course.faculty.toString() === req.user.id;
    
    if (!isAdmin && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this attendance record'
      });
    }
    
    // Update fields
    if (req.body.topic) attendance.topic = req.body.topic;
    if (req.body.notes) attendance.notes = req.body.notes;
    
    // Update records if provided
    if (req.body.records && Array.isArray(req.body.records)) {
      // Validate each record has valid student ID and status
      for (const record of req.body.records) {
        if (!record.student || !record.status) {
          return res.status(400).json({
            success: false,
            message: 'Each record must have student ID and status'
          });
        }
      }
      
      attendance.records = req.body.records;
    }
    
    // Save updated attendance
    const updatedAttendance = await attendance.save();
    
    res.status(200).json({
      success: true,
      data: updatedAttendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student attendance summary in a course
 * @param {String} studentId - Student ID
 * @param {String} courseId - Course ID
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Attendance summary
 */
const getStudentAttendanceSummary = async (studentId, courseId, userId, userRole) => {
  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });
  
  if (!enrollment) {
    const error = new Error('Student is not enrolled in this course');
    error.statusCode = 404;
    throw error;
  }
  
  // Check permission
  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student' && userId === studentId;
  
  // Check if faculty teaches this course
  let isFaculty = false;
  if (userRole === 'faculty') {
    const course = await Course.findById(courseId);
    isFaculty = course && course.faculty.toString() === userId;
  }
  
  if (!isAdmin && !isStudent && !isFaculty) {
    const error = new Error('Not authorized to view this attendance summary');
    error.statusCode = 403;
    throw error;
  }
  
  // Get all attendance records for the course
  const attendanceRecords = await Attendance.find({ course: courseId })
    .sort({ date: 1 });
  
  // Calculate attendance statistics
  let totalSessions = attendanceRecords.length;
  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;
  
  // Process each attendance record
  const attendanceDetails = attendanceRecords.map(record => {
    // Find this student's attendance in the record
    const studentRecord = record.records.find(
      r => r.student && r.student.toString() === studentId
    );
    
    // Count by status
    if (studentRecord) {
      if (studentRecord.status === 'present') present++;
      else if (studentRecord.status === 'absent') absent++;
      else if (studentRecord.status === 'late') late++;
      else if (studentRecord.status === 'excused') excused++;
    } else {
      // If no record for this student, count as absent
      absent++;
    }
    
    return {
      date: record.date,
      topic: record.topic,
      status: studentRecord ? studentRecord.status : 'absent',
      notes: studentRecord ? studentRecord.notes : null
    };
  });
  
  // Calculate attendance percentage
  const presentPercentage = totalSessions > 0 ? (present / totalSessions) * 100 : 0;
  const absentPercentage = totalSessions > 0 ? (absent / totalSessions) * 100 : 0;
  const latePercentage = totalSessions > 0 ? (late / totalSessions) * 100 : 0;
  const excusedPercentage = totalSessions > 0 ? (excused / totalSessions) * 100 : 0;
  
  return {
    summary: {
      totalSessions,
      present,
      absent,
      late,
      excused,
      presentPercentage,
      absentPercentage,
      latePercentage,
      excusedPercentage
    },
    attendanceDetails
  };
};

module.exports = {
  ...baseController,
  create,
  getById,
  update,
  getStudentAttendanceSummary
};
