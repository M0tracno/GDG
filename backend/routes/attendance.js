const router = require('express').Router();
const { Attendance, AttendanceRecord } = require('../models/Attendance');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { Op } = require('sequelize');
const Student = require('../models/Student');

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records (with filters)
 * @access  Private (Admin, Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Filtering parameters
    const where = {};
    if (req.query.courseId) where.courseId = req.query.courseId;
    if (req.query.date) where.date = new Date(req.query.date);
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.date = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }

    // If faculty is making the request, only show attendance for their courses
    if (req.user.role === 'faculty') {
      const facultyCourses = await Course.findAll({
        where: { facultyId: req.user.id },
        attributes: ['id']
      });
      const facultyCourseIds = facultyCourses.map(course => course.id);
      
      // Add to existing filter
      where.courseId = facultyCourseIds;
      
      // Override courseId filter if a specific course was requested
      if (req.query.courseId) {
        // Check if the requested course belongs to the faculty
        const courseExists = facultyCourseIds.includes(parseInt(req.query.courseId));
        if (!courseExists) {
          return res.status(403).json({ message: 'Not authorized to view attendance for this course' });
        }
        where.courseId = req.query.courseId;
      }
    }

    // Get attendance records with pagination and filters
    const attendance = await Attendance.findAndCountAll({
      where,
      include: [{
        model: AttendanceRecord,
        as: 'records',
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'rollNumber']
        }]
      }],
      order: [['date', 'DESC']],
      limit,
      offset
    });

    res.json({
      attendance: attendance.rows,
      total: attendance.count,
      page,
      totalPages: Math.ceil(attendance.count / limit)
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (Admin, Faculty teaching the course, Students in the course)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('courseId', 'name code facultyId')
      .populate('markedBy', 'firstName lastName')
      .populate('records.studentId', 'firstName lastName rollNumber');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    
    // Check if faculty is teaching this course
    const isFaculty = req.user.role === 'faculty' && 
                     attendance.courseId && 
                     attendance.courseId.facultyId && 
                     attendance.courseId.facultyId.toString() === req.user.id;
    
    // If student, check if they are enrolled in this course
    let isStudent = false;
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId: attendance.courseId._id,
        status: { $in: ['active', 'completed'] }
      });
      
      isStudent = !!enrollment;
      
      // If student is enrolled, filter the records to only show their own
      if (isStudent) {
        // Create a temporary attendance record with only student's data
        const filteredAttendance = JSON.parse(JSON.stringify(attendance));
        filteredAttendance.records = attendance.records.filter(
          record => record.studentId && record.studentId._id.toString() === req.user.id
        );
        
        return res.json({
          success: true,
          attendance: filteredAttendance
        });
      }
    }
    
    if (!isAdmin && !isFaculty && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to view this attendance record' });
    }

    // Admin and faculty can see full attendance
    res.json({
      success: true,
      attendance
    });
  } catch (err) {
    console.error('Get attendance by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/attendance
 * @desc    Create a new attendance record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    const { courseId, date, records, topic, notes } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check faculty permission
    if (req.user.role === 'faculty' && course.facultyId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
    }

    // Check if attendance record already exists for this date and course
    const existingAttendance = await Attendance.findOne({
      courseId,
      date: new Date(date)
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    // Validate records - each studentId must be enrolled in the course
    if (records && records.length > 0) {
      const enrollments = await Enrollment.find({
        courseId,
        status: 'active',
        studentId: { $in: records.map(r => r.studentId) }
      });
      
      const enrolledStudentIds = enrollments.map(e => e.studentId.toString());
      
      for (const record of records) {
        if (!enrolledStudentIds.includes(record.studentId.toString())) {
          return res.status(400).json({ 
            message: `Student ID ${record.studentId} is not enrolled in this course` 
          });
        }
      }
    }

    // Create new attendance record
    const attendance = new Attendance({
      courseId,
      date: new Date(date),
      records: records || [],
      markedBy: req.user.id,
      topic: topic || '',
      notes: notes || ''
    });

    // Save attendance to database
    const savedAttendance = await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      attendance: savedAttendance
    });
  } catch (err) {
    console.error('Create attendance error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (Admin, Faculty who created the record)
 */
router.put('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isCreator = attendance.markedBy && attendance.markedBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }

    // Fields to update
    const { records, topic, notes } = req.body;

    // Update fields if provided
    if (records) attendance.records = records;
    if (topic !== undefined) attendance.topic = topic;
    if (notes !== undefined) attendance.notes = notes;
    
    // Admin can update date and course
    if (isAdmin) {
      if (req.body.date) attendance.date = new Date(req.body.date);
      if (req.body.courseId) {
        // Check if course exists
        const course = await Course.findById(req.body.courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        attendance.courseId = req.body.courseId;
      }
    }

    // Save updated attendance
    const updatedAttendance = await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: updatedAttendance
    });
  } catch (err) {
    console.error('Update attendance error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Delete attendance record
    await attendance.remove();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    console.error('Delete attendance error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/attendance/student/:studentId/course/:courseId
 * @desc    Get attendance summary for a student in a specific course
 * @access  Private (Admin, Faculty teaching the course, Student themselves)
 */
router.get('/student/:studentId/course/:courseId', auth, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $in: ['active', 'completed'] }
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Student is not enrolled in this course' });
    }
    
    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isStudent = req.user.role === 'student' && req.user.id === studentId;
    
    // Check if faculty teaches this course
    let isFaculty = false;
    if (req.user.role === 'faculty') {
      const course = await Course.findById(courseId);
      isFaculty = course && course.facultyId.toString() === req.user.id;
    }
    
    if (!isAdmin && !isStudent && !isFaculty) {
      return res.status(403).json({ message: 'Not authorized to view this attendance summary' });
    }
    
    // Get all attendance records for the course
    const attendanceRecords = await Attendance.find({ courseId })
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
        r => r.studentId && r.studentId.toString() === studentId
      );
      
      // Count by status
      if (studentRecord) {
        switch (studentRecord.status) {
          case 'present': present++; break;
          case 'absent': absent++; break;
          case 'late': late++; break;
          case 'excused': excused++; break;
          default: break;
        }
      } else {
        // If no record found, consider absent
        absent++;
      }
      
      return {
        date: record.date,
        status: studentRecord ? studentRecord.status : 'absent',
        remarks: studentRecord ? studentRecord.remarks : '',
        topic: record.topic
      };
    });
    
    // Calculate percentages
    const attendanceRate = totalSessions > 0 ? ((present + late) / totalSessions) * 100 : 0;
    
    res.json({
      success: true,
      studentId,
      courseId,
      summary: {
        totalSessions,
        present,
        absent,
        late,
        excused,
        attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
      },
      attendanceDetails
    });
  } catch (err) {
    console.error('Get student attendance summary error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 