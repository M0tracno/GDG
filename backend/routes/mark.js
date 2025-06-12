const router = require('express').Router();
const { Mark, MarkRecord } = require('../models/Mark');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { Op } = require('sequelize');

/**
 * @route   GET /api/marks
 * @desc    Get marks/assessments (with filters)
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
    if (req.query.assessmentType) where.assessmentType = req.query.assessmentType;
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.date = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }

    // If faculty is making the request, only show marks for their courses
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
          return res.status(403).json({ message: 'Not authorized to view marks for this course' });
        }
        where.courseId = req.query.courseId;
      }
    }

    // Get marks with pagination and filters
    const marks = await Mark.findAndCountAll({
      where,
      include: [{
        model: MarkRecord,
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
      marks: marks.rows,
      total: marks.count,
      page,
      totalPages: Math.ceil(marks.count / limit)
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/marks/:id
 * @desc    Get mark/assessment by ID
 * @access  Private (Admin, Faculty teaching the course, Students in the course)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('courseId', 'name code facultyId')
      .populate('gradedBy', 'firstName lastName')
      .populate('records.studentId', 'firstName lastName rollNumber');
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    
    // Check if faculty is teaching this course
    const isFaculty = req.user.role === 'faculty' && 
                     mark.courseId && 
                     mark.courseId.facultyId && 
                     mark.courseId.facultyId.toString() === req.user.id;
    
    // If student, check if they are enrolled in this course
    let isStudent = false;
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId: mark.courseId._id,
        status: { $in: ['active', 'completed'] }
      });
      
      isStudent = !!enrollment;
      
      // If student is enrolled, filter the records to only show their own
      if (isStudent) {
        // Create a temporary mark record with only student's data
        const filteredMark = JSON.parse(JSON.stringify(mark));
        filteredMark.records = mark.records.filter(
          record => record.studentId && record.studentId._id.toString() === req.user.id
        );
        
        return res.json({
          success: true,
          mark: filteredMark
        });
      }
    }
    
    if (!isAdmin && !isFaculty && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to view this mark record' });
    }

    // Admin and faculty can see full mark record
    res.json({
      success: true,
      mark
    });
  } catch (err) {
    console.error('Get mark by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/marks
 * @desc    Create a new mark/assessment record
 * @access  Private (Admin, Faculty teaching the course)
 */
router.post('/', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    const { 
      courseId, 
      assessmentName, 
      assessmentType, 
      totalMarks, 
      weightage, 
      date, 
      description, 
      records
    } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check faculty permission
    if (req.user.role === 'faculty' && course.facultyId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add marks for this course' });
    }

    // Check if mark record already exists for this assessment name in this course
    const existingMark = await Mark.findOne({
      courseId,
      assessmentName,
      assessmentType
    });
    
    if (existingMark) {
      return res.status(400).json({ 
        message: 'A mark record already exists for this assessment name and type in this course' 
      });
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
        
        // Validate marks
        if (record.obtainedMarks > totalMarks) {
          return res.status(400).json({ 
            message: `Obtained marks cannot exceed total marks for student ID ${record.studentId}` 
          });
        }
      }
    }

    // Create new mark record
    const mark = new Mark({
      courseId,
      assessmentName,
      assessmentType,
      totalMarks,
      weightage,
      date: new Date(date),
      description: description || '',
      records: records || [],
      gradedBy: req.user.id,
      attachmentUrl: req.body.attachmentUrl || ''
    });

    // Save mark to database
    const savedMark = await mark.save();

    res.status(201).json({
      success: true,
      message: 'Mark record created successfully',
      mark: savedMark
    });
  } catch (err) {
    console.error('Create mark error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/marks/:id
 * @desc    Update mark/assessment record
 * @access  Private (Admin, Faculty who created the record)
 */
router.put('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    let mark = await Mark.findById(req.params.id);
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isCreator = mark.gradedBy && mark.gradedBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update this mark record' });
    }

    // Fields to update
    const { 
      assessmentName, 
      assessmentType, 
      totalMarks, 
      weightage, 
      date, 
      description, 
      records,
      attachmentUrl
    } = req.body;

    // Update basic fields if provided
    if (assessmentName) mark.assessmentName = assessmentName;
    if (assessmentType) mark.assessmentType = assessmentType;
    if (totalMarks !== undefined) mark.totalMarks = totalMarks;
    if (weightage !== undefined) mark.weightage = weightage;
    if (date) mark.date = new Date(date);
    if (description !== undefined) mark.description = description;
    if (attachmentUrl !== undefined) mark.attachmentUrl = attachmentUrl;
    
    // Update records if provided
    if (records) {
      // Validate records
      for (const record of records) {
        if (record.obtainedMarks > mark.totalMarks) {
          return res.status(400).json({ 
            message: `Obtained marks cannot exceed total marks for student ID ${record.studentId}` 
          });
        }
      }
      
      mark.records = records;
    }
    
    // Admin can update courseId
    if (isAdmin && req.body.courseId) {
      // Check if course exists
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      mark.courseId = req.body.courseId;
    }

    // Save updated mark
    const updatedMark = await mark.save();

    res.json({
      success: true,
      message: 'Mark record updated successfully',
      mark: updatedMark
    });
  } catch (err) {
    console.error('Update mark error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/marks/:id
 * @desc    Delete mark/assessment record
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }

    // Delete mark record
    await mark.remove();

    res.json({
      success: true,
      message: 'Mark record deleted successfully'
    });
  } catch (err) {
    console.error('Delete mark error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/marks/student/:studentId/course/:courseId
 * @desc    Get marks summary for a student in a specific course
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
      return res.status(403).json({ message: 'Not authorized to view this marks summary' });
    }
    
    // Get all mark records for the course
    const markRecords = await Mark.find({ courseId })
      .sort({ date: 1 });
    
    // Calculate marks statistics
    let totalAssessments = markRecords.length;
    let totalWeightage = 0;
    let weightedPercentage = 0;
    
    // Process each mark record
    const markDetails = markRecords.map(record => {
      // Find this student's mark in the record
      const studentRecord = record.records.find(
        r => r.studentId && r.studentId.toString() === studentId
      );
      
      let obtainedMarks = 0;
      let percentage = 0;
      let weightedScore = 0;
      
      if (studentRecord) {
        obtainedMarks = studentRecord.obtainedMarks;
        percentage = (obtainedMarks / record.totalMarks) * 100;
        weightedScore = percentage * (record.weightage / 100);
        
        // Add to overall weighted percentage
        totalWeightage += record.weightage;
        weightedPercentage += weightedScore;
      }
      
      return {
        assessmentId: record._id,
        assessmentName: record.assessmentName,
        assessmentType: record.assessmentType,
        date: record.date,
        totalMarks: record.totalMarks,
        obtainedMarks: studentRecord ? obtainedMarks : 0,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        weightage: record.weightage,
        weightedScore: Math.round(weightedScore * 100) / 100, // Round to 2 decimal places
        remarks: studentRecord ? studentRecord.remarks : ''
      };
    });
    
    // Calculate overall grade
    const overallPercentage = totalWeightage > 0 ? Math.round((weightedPercentage / totalWeightage) * 100) * 100 : 0;
    
    // Determine letter grade based on percentage (example grading scale)
    let letterGrade = '';
    if (overallPercentage >= 90) letterGrade = 'A+';
    else if (overallPercentage >= 85) letterGrade = 'A';
    else if (overallPercentage >= 80) letterGrade = 'A-';
    else if (overallPercentage >= 75) letterGrade = 'B+';
    else if (overallPercentage >= 70) letterGrade = 'B';
    else if (overallPercentage >= 65) letterGrade = 'B-';
    else if (overallPercentage >= 60) letterGrade = 'C+';
    else if (overallPercentage >= 55) letterGrade = 'C';
    else if (overallPercentage >= 50) letterGrade = 'C-';
    else if (overallPercentage >= 45) letterGrade = 'D+';
    else if (overallPercentage >= 40) letterGrade = 'D';
    else letterGrade = 'F';
    
    res.json({
      success: true,
      studentId,
      courseId,
      summary: {
        totalAssessments,
        totalWeightage,
        overallPercentage: Math.round((weightedPercentage / totalWeightage) * 100) / 100, // Round to 2 decimal places
        letterGrade
      },
      markDetails
    });
  } catch (err) {
    console.error('Get student marks summary error:', err);
    
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