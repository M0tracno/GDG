const router = require('express').Router();
const Faculty = require('../models/Faculty');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const { facultyValidation, idParamValidation } = require('../middleware/validation');

/**
 * @route   GET /api/faculty
 * @desc    Get all faculty members (paginated)
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
    if (req.query.department) filter.department = req.query.department;
    if (req.query.position) filter.position = req.query.position;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    // Search parameter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex }
      ];
    }

    // Execute query with pagination
    const faculty = await Faculty.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Faculty.countDocuments(filter);

    res.json({
      success: true,
      count: faculty.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      faculty
    });
  } catch (err) {
    console.error('Get all faculty error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/faculty/:id
 * @desc    Get faculty by ID
 * @access  Private (Admin, Faculty, or related Student)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check permission - admin can view any faculty, faculty can view self, 
    // students can view faculty if they are enrolled in their course
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && req.user.id === faculty._id.toString());
    
    // TODO: Add logic for students to view their teachers if needed

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this faculty' });
    }

    res.json({
      success: true,
      faculty
    });
  } catch (err) {
    console.error('Get faculty by ID error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/faculty/:id
 * @desc    Update faculty profile
 * @access  Private (Admin or Self)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    let faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check permission - admin can update any faculty, faculty can update self
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && req.user.id === faculty._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this faculty' });
    }

    // Fields to update
    const {
      firstName,
      lastName,
      email,
      department,
      position,
      contactNumber,
      address,
      profilePictureUrl,
      password,
      ...otherFields
    } = req.body;

    // Update basic fields if provided
    if (firstName) faculty.firstName = firstName;
    if (lastName) faculty.lastName = lastName;
    if (email) faculty.email = email;
    if (department) faculty.department = department;
    if (position) faculty.position = position;
    if (contactNumber) faculty.contactNumber = contactNumber;
    if (address) faculty.address = address;
    if (profilePictureUrl) faculty.profilePictureUrl = profilePictureUrl;

    // Only admin can update certain fields
    if (req.user.role === 'admin') {
      if (otherFields.employeeId) faculty.employeeId = otherFields.employeeId;
      if (otherFields.isActive !== undefined) faculty.isActive = otherFields.isActive;
      // Add any other admin-only fields here
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      faculty.password = await bcrypt.hash(password, salt);
    }

    // Save updated faculty
    const updatedFaculty = await faculty.save();

    res.json({
      success: true,
      message: 'Faculty updated successfully',
      faculty: updatedFaculty
    });
  } catch (err) {
    console.error('Update faculty error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/faculty/:id
 * @desc    Delete faculty
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Optional: Instead of deleting, set isActive to false
    faculty.isActive = false;
    await faculty.save();

    // Or actually delete (uncomment the line below)
    // await faculty.remove();

    res.json({
      success: true,
      message: 'Faculty deactivated successfully'
    });
  } catch (err) {
    console.error('Delete faculty error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/faculty/:id/courses
 * @desc    Get all courses taught by a faculty member
 * @access  Private (Admin, Faculty, or related Student)
 */
router.get('/:id/courses', auth, async (req, res) => {
  try {
    // Check if faculty exists
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Populate courses using the virtual field
    await faculty.populate('courses');
    
    res.json({
      success: true,
      courses: faculty.courses
    });
  } catch (err) {
    console.error('Get faculty courses error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/faculty/:id/profile-picture
 * @desc    Upload faculty profile picture
 * @access  Private (Admin or Self)
 */
router.post('/:id/profile-picture', auth, idParamValidation, upload.single('profilePicture'), async (req, res) => {
  try {
    let faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check permission - admin can update any faculty, faculty can update self
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'faculty' && req.user.id === faculty._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this faculty' });
    }

    // If no file uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Update profile picture URL
    faculty.profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    await faculty.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: faculty.profilePictureUrl
    });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 