const router = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { courseValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/courses
 * @desc    Get all courses (paginated)
 * @access  Private (Any authenticated user)
 */
router.get('/', auth, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    // Search parameter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }

    // Execute query with pagination
    const courses = await Course.find(filter)
      .populate('facultyId', 'firstName lastName')
      .sort({ academicYear: -1, semester: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      courses
    });
  } catch (err) {
    console.error('Get all courses error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Private (Any authenticated user with access to the course)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('facultyId', 'firstName lastName email department position');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permission based on role
    let isAuthorized = req.user.role === 'admin';
    
    // Faculty can view if they teach the course
    if (req.user.role === 'faculty') {
      isAuthorized = course.facultyId && course.facultyId._id.toString() === req.user.id;
    }
    
    // Student can view if they're enrolled
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId: course._id,
        status: { $in: ['active', 'completed'] }
      });
      
      isAuthorized = !!enrollment;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this course' });
    }

    res.json({
      success: true,
      course
    });
  } catch (err) {
    console.error('Get course by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      classId,
      section,
      facultyId,
      academicYear,
      semester,
      startDate,
      endDate,
      schedule,
      creditHours,
      maxCapacity
    } = req.body;

    // Check if course with this code already exists for the given academic year and semester
    const existingCourse = await Course.findOne({
      code,
      academicYear,
      semester,
      classId,
      section
    });

    if (existingCourse) {
      return res.status(400).json({
        message: 'A course with this code already exists for the specified academic year, semester, class and section'
      });
    }

    // Create new course
    const course = new Course({
      name,
      code,
      description,
      classId,
      section,
      facultyId,
      academicYear,
      semester,
      startDate,
      endDate,
      schedule,
      creditHours,
      maxCapacity,
      isActive: true
    });

    // Save course to database
    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: savedCourse
    });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Admin or assigned Faculty)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permission
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && course.facultyId.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Admin can update all fields, faculty can only update certain fields
    const {
      name,
      description,
      schedule,
      ...otherFields
    } = req.body;

    // Fields that any authorized user can update
    if (name) course.name = name;
    if (description) course.description = description;
    if (schedule) course.schedule = schedule;

    // Fields that only admin can update
    if (req.user.role === 'admin') {
      if (otherFields.code) course.code = otherFields.code;
      if (otherFields.classId) course.classId = otherFields.classId;
      if (otherFields.section) course.section = otherFields.section;
      if (otherFields.facultyId) course.facultyId = otherFields.facultyId;
      if (otherFields.academicYear) course.academicYear = otherFields.academicYear;
      if (otherFields.semester) course.semester = otherFields.semester;
      if (otherFields.startDate) course.startDate = otherFields.startDate;
      if (otherFields.endDate) course.endDate = otherFields.endDate;
      if (otherFields.creditHours) course.creditHours = otherFields.creditHours;
      if (otherFields.maxCapacity) course.maxCapacity = otherFields.maxCapacity;
      if (otherFields.isActive !== undefined) course.isActive = otherFields.isActive;
    }

    // Save updated course
    const updatedCourse = await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (err) {
    console.error('Update course error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Optional: Instead of deleting, set isActive to false
    course.isActive = false;
    await course.save();

    // Or actually delete (uncomment the line below)
    // await course.remove();

    res.json({
      success: true,
      message: 'Course deactivated successfully'
    });
  } catch (err) {
    console.error('Delete course error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/courses/:id/students
 * @desc    Get all students enrolled in a course
 * @access  Private (Admin or assigned Faculty)
 */
router.get('/:id/students', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permission
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && course.facultyId.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view students for this course' });
    }

    // Get enrollments and populate student details
    const enrollments = await Enrollment.find({
      courseId: course._id,
      status: { $in: ['active', 'completed'] }
    }).populate('studentId', 'firstName lastName rollNumber email classId section');

    const students = enrollments.map(enrollment => ({
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        grade: enrollment.grade
      },
      student: enrollment.studentId
    }));

    res.json({
      success: true,
      courseId: course._id,
      courseName: course.name,
      courseCode: course.code,
      students
    });
  } catch (err) {
    console.error('Get course students error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/courses/:id/materials
 * @desc    Upload course materials
 * @access  Private (Admin or assigned Faculty)
 */
router.post('/:id/materials', auth, idParamValidation, upload.single('material'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permission - admin or assigned faculty can upload materials
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && course.facultyId.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to upload materials for this course' });
    }

    // If no file uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Add material to course
    const newMaterial = {
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      type: req.body.type || 'document',
      fileUrl: `/uploads/courses/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    // Initialize materials array if it doesn't exist
    if (!course.materials) {
      course.materials = [];
    }

    course.materials.push(newMaterial);
    await course.save();

    res.json({
      success: true,
      message: 'Course material uploaded successfully',
      material: newMaterial
    });
  } catch (err) {
    console.error('Upload course material error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 