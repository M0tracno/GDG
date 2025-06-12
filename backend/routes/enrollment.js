const router = require('express').Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (paginated, with filters)
 * @access  Private (Admin or Faculty)
 */
router.get('/', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;

    // If faculty is making the request, only show enrollments for their courses
    if (req.user.role === 'faculty') {
      const facultyCourses = await Course.find({ facultyId: req.user.id }).select('_id');
      const facultyCourseIds = facultyCourses.map(course => course._id);
      
      // Add to existing filter
      filter.courseId = { $in: facultyCourseIds };
      
      // Override courseId filter if a specific course was requested
      if (req.query.courseId) {
        // Check if the requested course belongs to the faculty
        const courseExists = facultyCourseIds.some(id => id.toString() === req.query.courseId);
        if (!courseExists) {
          return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
        }
        filter.courseId = req.query.courseId;
      }
    }

    // Execute query with pagination
    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName rollNumber email')
      .populate('courseId', 'name code facultyId')
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      count: enrollments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      enrollments
    });
  } catch (err) {
    console.error('Get all enrollments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private (Admin, Faculty teaching the course, Student enrolled)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('studentId', 'firstName lastName rollNumber email classId section')
      .populate({
        path: 'courseId',
        select: 'name code facultyId academicYear semester',
        populate: {
          path: 'facultyId',
          select: 'firstName lastName'
        }
      });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isStudent = req.user.role === 'student' && 
                    enrollment.studentId && 
                    enrollment.studentId._id.toString() === req.user.id;
    const isFaculty = req.user.role === 'faculty' && 
                     enrollment.courseId && 
                     enrollment.courseId.facultyId && 
                     enrollment.courseId.facultyId._id.toString() === req.user.id;
    
    if (!isAdmin && !isStudent && !isFaculty) {
      return res.status(403).json({ message: 'Not authorized to view this enrollment' });
    }

    res.json({
      success: true,
      enrollment
    });
  } catch (err) {
    console.error('Get enrollment by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/enrollments
 * @desc    Create a new enrollment
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({ message: 'Cannot enroll in an inactive course' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    // Check if course is at capacity
    const enrollmentCount = await Enrollment.countDocuments({ 
      courseId, 
      status: { $in: ['active', 'completed'] } 
    });
    
    if (enrollmentCount >= course.maxCapacity) {
      return res.status(400).json({ message: 'Course has reached maximum capacity' });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      studentId,
      courseId,
      status: 'active',
      enrollmentDate: new Date(),
      grade: '',
      remarks: req.body.remarks || ''
    });

    // Save enrollment to database
    const savedEnrollment = await enrollment.save();

    // Populate student and course information for response
    await savedEnrollment.populate('studentId', 'firstName lastName rollNumber');
    await savedEnrollment.populate('courseId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      enrollment: savedEnrollment
    });
  } catch (err) {
    console.error('Create enrollment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/enrollments/:id
 * @desc    Update enrollment (e.g., change status, grade)
 * @access  Private (Admin or Faculty teaching the course)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    let enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Get the course to check faculty permissions
    const course = await Course.findById(enrollment.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Associated course not found' });
    }

    // Check permission
    const isAdmin = req.user.role === 'admin';
    const isFaculty = req.user.role === 'faculty' && course.facultyId.toString() === req.user.id;
    
    if (!isAdmin && !isFaculty) {
      return res.status(403).json({ message: 'Not authorized to update this enrollment' });
    }

    // Update fields
    const { status, grade, remarks } = req.body;

    // Admin can update all fields
    if (isAdmin) {
      if (status) enrollment.status = status;
    }

    // Both admin and faculty can update grade and remarks
    if (grade !== undefined) enrollment.grade = grade;
    if (remarks !== undefined) enrollment.remarks = remarks;

    // Save updated enrollment
    const updatedEnrollment = await enrollment.save();

    // Populate student and course information for response
    await updatedEnrollment.populate('studentId', 'firstName lastName rollNumber');
    await updatedEnrollment.populate('courseId', 'name code');

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment: updatedEnrollment
    });
  } catch (err) {
    console.error('Update enrollment error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Delete enrollment
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Delete enrollment
    await enrollment.remove();

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (err) {
    console.error('Delete enrollment error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/enrollments/bulk
 * @desc    Create multiple enrollments at once
 * @access  Private (Admin only)
 */
router.post('/bulk', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;

    if (!courseId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Course ID and an array of student IDs are required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({ message: 'Cannot enroll in an inactive course' });
    }

    // Check if course will exceed capacity
    const currentEnrollments = await Enrollment.countDocuments({ 
      courseId, 
      status: { $in: ['active', 'completed'] } 
    });
    
    if (currentEnrollments + studentIds.length > course.maxCapacity) {
      return res.status(400).json({ 
        message: `Enrolling these students would exceed the course's capacity of ${course.maxCapacity}` 
      });
    }

    // Track results
    const results = {
      success: [],
      failed: []
    };

    // Process each student
    for (const studentId of studentIds) {
      try {
        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
          results.failed.push({
            studentId,
            reason: 'Student not found'
          });
          continue;
        }

        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
          results.failed.push({
            studentId,
            reason: 'Student is already enrolled in this course'
          });
          continue;
        }

        // Create new enrollment
        const enrollment = new Enrollment({
          studentId,
          courseId,
          status: 'active',
          enrollmentDate: new Date(),
          grade: '',
          remarks: ''
        });

        // Save enrollment
        const savedEnrollment = await enrollment.save();
        results.success.push({
          enrollmentId: savedEnrollment._id,
          studentId
        });
      } catch (err) {
        results.failed.push({
          studentId,
          reason: err.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully enrolled ${results.success.length} out of ${studentIds.length} students`,
      results
    });
  } catch (err) {
    console.error('Bulk enrollment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 