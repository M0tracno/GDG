const router = require('express').Router();
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/students
 * @desc    Get all students (paginated)
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
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    // Search parameter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex }
      ];
    }

    // Execute query with pagination
    const students = await Student.find(filter)
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      students
    });
  } catch (err) {
    console.error('Get all students error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private (Admin, Faculty, Self)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check permission - admin can view any student, faculty can view their students, 
    // student can view self
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'student' && req.user.id === student._id.toString());
    
    // If faculty, check if they teach any course this student is enrolled in
    let facultyAuthorized = false;
    if (req.user.role === 'faculty') {
      const enrollments = await Enrollment.find({ studentId: student._id, status: 'active' })
                                         .populate('courseId');
      
      facultyAuthorized = enrollments.some(enrollment => 
        enrollment.courseId && enrollment.courseId.facultyId && 
        enrollment.courseId.facultyId.toString() === req.user.id
      );
    }

    if (!isAuthorized && !facultyAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this student' });
    }

    res.json({
      success: true,
      student
    });
  } catch (err) {
    console.error('Get student by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile
 * @access  Private (Admin or Self)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check permission - admin can update any student, student can update self
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'student' && req.user.id === student._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this student' });
    }

    // Fields to update
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      profilePictureUrl,
      password,
      ...otherFields
    } = req.body;

    // Update basic fields if provided
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (email) student.email = email;
    if (contactNumber) student.contactNumber = contactNumber;
    if (address) student.address = address;
    if (profilePictureUrl) student.profilePictureUrl = profilePictureUrl;

    // Only admin can update certain fields
    if (req.user.role === 'admin') {
      if (otherFields.rollNumber) student.rollNumber = otherFields.rollNumber;
      if (otherFields.classId) student.classId = otherFields.classId;
      if (otherFields.section) student.section = otherFields.section;
      if (otherFields.parentId) student.parentId = otherFields.parentId;
      if (otherFields.isActive !== undefined) student.isActive = otherFields.isActive;
      if (otherFields.dateOfBirth) student.dateOfBirth = otherFields.dateOfBirth;
      // Add any other admin-only fields here
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    // Save updated student
    const updatedStudent = await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (err) {
    console.error('Update student error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Optional: Instead of deleting, set isActive to false
    student.isActive = false;
    await student.save();

    // Or actually delete (uncomment the line below)
    // await student.remove();

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (err) {
    console.error('Delete student error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/students/:id/enrollments
 * @desc    Get all enrollments for a student
 * @access  Private (Admin, Faculty teaching the student, or Self)
 */
router.get('/:id/enrollments', auth, async (req, res) => {
  try {
    // Check if student exists
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check permission
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'student' && req.user.id === student._id.toString());
    
    // If not admin or self, check if faculty teaches this student
    let facultyAuthorized = false;
    if (req.user.role === 'faculty' && !isAuthorized) {
      // This will be handled after fetching enrollments
      facultyAuthorized = true;
    }
    
    if (!isAuthorized && !facultyAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s enrollments' });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ studentId: req.params.id })
                                      .populate('courseId');
    
    // If faculty, filter to only show enrollments in their courses
    if (req.user.role === 'faculty' && !isAuthorized) {
      const facultyEnrollments = enrollments.filter(enrollment => 
        enrollment.courseId && 
        enrollment.courseId.facultyId && 
        enrollment.courseId.facultyId.toString() === req.user.id
      );
      
      return res.json({
        success: true,
        enrollments: facultyEnrollments
      });
    }

    res.json({
      success: true,
      enrollments
    });
  } catch (err) {
    console.error('Get student enrollments error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 