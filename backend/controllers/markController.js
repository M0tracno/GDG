const { Mark, Course, Enrollment, Student } = require('../models/mongodb-models');
const createBaseController = require('./baseController');

// Get base controller functions
const baseController = createBaseController(Mark);

/**
 * Create mark record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const create = async (req, res, next) => {
  try {
    const { course, title, description, assessmentType, date, totalMarks, weightage, records } = req.body;
    
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
        message: 'Not authorized to create marks for this course'
      });
    }
    
    // Create mark record
    const mark = await Mark.create({
      course,
      title,
      description,
      assessmentType,
      date: new Date(date),
      totalMarks,
      weightage,
      gradedBy: req.user.id,
      records: records || []
    });
    
    res.status(201).json({
      success: true,
      data: mark
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mark by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getById = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('course')
      .populate('gradedBy', 'firstName lastName')
      .populate('records.student', 'firstName lastName rollNumber');
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark record not found'
      });
    }
    
    // Check permission
    const isAdmin = req.user.role === 'admin';
    
    // Check if faculty is teaching this course
    const isFaculty = req.user.role === 'faculty' && 
                     mark.course && 
                     mark.course.faculty && 
                     mark.course.faculty.toString() === req.user.id;
    
    // If student, check if they are in this record
    let isStudent = false;
    if (req.user.role === 'student') {
      const studentRecord = mark.records.find(
        record => record.student && record.student._id.toString() === req.user.id
      );
      isStudent = !!studentRecord;
      
      // If student is enrolled, filter the records to only show their own
      if (isStudent) {
        const filteredMark = JSON.parse(JSON.stringify(mark));
        filteredMark.records = mark.records.filter(
          record => record.student && record.student._id.toString() === req.user.id
        );
        
        return res.status(200).json({
          success: true,
          data: filteredMark
        });
      }
    }
    
    if (!isAdmin && !isFaculty && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this mark record'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mark
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update mark record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const update = async (req, res, next) => {
  try {
    let mark = await Mark.findById(req.params.id).populate('course');
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark record not found'
      });
    }
    
    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isFaculty = req.user.role === 'faculty' && 
                     mark.course && 
                     mark.course.faculty && 
                     mark.course.faculty.toString() === req.user.id;
    
    if (!isAdmin && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this mark record'
      });
    }
    
    // Update fields
    if (req.body.title) mark.title = req.body.title;
    if (req.body.description) mark.description = req.body.description;
    if (req.body.assessmentType) mark.assessmentType = req.body.assessmentType;
    if (req.body.date) mark.date = new Date(req.body.date);
    if (req.body.totalMarks) mark.totalMarks = req.body.totalMarks;
    if (req.body.weightage) mark.weightage = req.body.weightage;
    
    // Update records if provided
    if (req.body.records && Array.isArray(req.body.records)) {
      // Validate each record has valid student ID and marks
      for (const record of req.body.records) {
        if (!record.student || record.obtainedMarks === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Each record must have student ID and obtained marks'
          });
        }
      }
      
      mark.records = req.body.records;
    }
    
    // Save updated mark
    const updatedMark = await mark.save();
    
    res.status(200).json({
      success: true,
      data: updatedMark
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student marks summary in a course
 * @param {String} studentId - Student ID
 * @param {String} courseId - Course ID
 * @param {String} userId - Current user ID
 * @param {String} userRole - Current user role
 * @returns {Object} - Marks summary
 */
const getStudentMarksSummary = async (studentId, courseId, userId, userRole) => {
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
    const error = new Error('Not authorized to view this marks summary');
    error.statusCode = 403;
    throw error;
  }
  
  // Get all mark records for the course
  const markRecords = await Mark.find({ course: courseId })
    .sort({ date: 1 });
  
  // Calculate marks statistics
  let totalAssessments = markRecords.length;
  let totalWeightage = 0;
  let weightedPercentage = 0;
  
  // Process each mark record
  const markDetails = markRecords.map(record => {
    // Find this student's mark in the record
    const studentRecord = record.records.find(
      r => r.student && r.student.toString() === studentId
    );
    
    // Calculate percentage for this assessment
    const obtainedMarks = studentRecord ? studentRecord.obtainedMarks : 0;
    const totalMarks = record.totalMarks || 100;
    const percentage = (obtainedMarks / totalMarks) * 100;
    
    // Add to total weightage
    totalWeightage += (record.weightage || 1);
    
    // Add weighted percentage to total
    weightedPercentage += percentage * (record.weightage || 1);
    
    return {
      title: record.title,
      date: record.date,
      assessmentType: record.assessmentType,
      totalMarks: record.totalMarks,
      obtainedMarks: studentRecord ? studentRecord.obtainedMarks : 0,
      percentage: percentage,
      weightage: record.weightage || 1,
      feedback: studentRecord ? studentRecord.feedback : null
    };
  });
  
  // Calculate overall percentage and letter grade
  const overallPercentage = totalWeightage > 0 ? (weightedPercentage / totalWeightage) : 0;
  
  // Determine letter grade
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
  
  return {
    summary: {
      totalAssessments,
      totalWeightage,
      overallPercentage: Math.round(overallPercentage * 100) / 100, // Round to 2 decimal places
      letterGrade
    },
    markDetails
  };
};

module.exports = {
  ...baseController,
  create,
  getById,
  update,
  getStudentMarksSummary
};
