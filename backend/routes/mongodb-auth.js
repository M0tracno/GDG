// MongoDB authentication routes
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Faculty, Student } = require('../models/mongodb-models');
const config = require('../config/config');
const auth = require('../middleware/auth');
const { loginValidation } = require('../middleware/validation');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginValidation, async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;
    
  // Find the user based on role
    if (role === 'faculty' || role === 'admin') {
      // Admin users are stored in the Faculty collection with role='admin'
      user = await Faculty.findOne({ email }).select('+password');
    } else if (role === 'student') {
      user = await Student.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }    // Determine the user's actual role (using the one from DB if it exists)
    const userRole = user.role || role;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: userRole },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Send response with token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: userRole,
        isAdmin: user.isAdmin,
        ...(userRole === 'faculty' && { employeeId: user.employeeId }),
        ...(userRole === 'student' && { studentId: user.studentId })
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    let user;
      if (req.user.role === 'faculty' || req.user.role === 'admin') {
      user = await Faculty.findById(req.user.id).select('-password');
    } else if (req.user.role === 'student') {
      user = await Student.findById(req.user.id).select('-password');
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: req.user.role,
        ...(req.user.role === 'faculty' && { 
          employeeId: user.employeeId,
          department: user.department,
          title: user.title,
          avatar: user.avatar
        }),
        ...(req.user.role === 'student' && { 
          studentId: user.studentId,
          grade: user.grade,
          avatar: user.avatar
        })
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user data' 
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    let user;
    
    // Get user with password included
    if (req.user.role === 'faculty') {
      user = await Faculty.findById(req.user.id).select('+password');
    } else if (req.user.role === 'student') {
      user = await Student.findById(req.user.id).select('+password');
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password change' 
    });
  }
});

module.exports = router;
