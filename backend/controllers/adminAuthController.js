// Admin Authentication Controller
const bcrypt = require('bcryptjs');
const { Faculty, Student } = require('../models/mongodb-models');

/**
 * Create a new user with admin privileges
 * Sets password directly without email invitation
 */
exports.createUserWithPassword = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password, additionalData } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (firstName, lastName, email, role, password) are required'
      });
    }

    // Check if user with this email already exists
    let existingUser;
    if (role === 'faculty') {
      existingUser = await Faculty.findOne({ email });
    } else if (role === 'student') {
      existingUser = await Student.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be either "faculty" or "student"'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `A ${role} with this email already exists`
      });
    }    // Create basic user object (password will be hashed by the model's pre-save hook)
    const userData = {
      firstName,
      lastName,
      email,
      active: true,
      password: password, // Don't hash here - let the model handle it
      passwordSetDate: Date.now(),
      ...additionalData
    };

    // Add role-specific fields
    if (role === 'faculty') {
      userData.employeeId = additionalData?.employeeId || `EMP${Date.now()}`;
      userData.department = additionalData?.department || 'General';
      userData.title = additionalData?.title || 'Instructor';
    } else if (role === 'student') {
      userData.studentId = additionalData?.studentId || `STU${Date.now()}`;
      userData.grade = additionalData?.grade || 'General';
        }

    // Create the user in the database
    let newUser;
    if (role === 'faculty') {
      newUser = await Faculty.create(userData);
    } else {
      newUser = await Student.create(userData);
    }

    // Return success response without sensitive data
    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role,
        ...(role === 'faculty' && { 
          employeeId: newUser.employeeId,
          department: newUser.department,
          title: newUser.title
        }),
        ...(role === 'student' && { 
          studentId: newUser.studentId,
          grade: newUser.grade
        })
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation',
      error: error.message
    });
  }
};

/**
 * Get all users (faculty and students)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all faculty and students
    const faculty = await Faculty.find({}, {
      password: 0 // Exclude password from response
    });
    
    const students = await Student.find({}, {
      password: 0 // Exclude password from response
    });

    // Format the response
    const users = [
      ...faculty.map(f => ({
        id: f._id,
        firstName: f.firstName,
        lastName: f.lastName,
        name: `${f.firstName} ${f.lastName}`,
        email: f.email,
        role: 'Faculty',
        status: f.active ? 'Active' : 'Inactive',
        employeeId: f.employeeId,
        department: f.department,
        title: f.title
      })),
      ...students.map(s => ({
        id: s._id,
        firstName: s.firstName,
        lastName: s.lastName,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        role: 'Student',
        status: s.active ? 'Active' : 'Inactive',
        studentId: s.studentId,
        grade: s.grade
      }))
    ];

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users',
      error: error.message
    });
  }
};

/**
 * Update an existing user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, password, additionalData } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields (firstName, lastName, email, role) are required'
      });
    }

    // Find the user first to determine which collection to update
    let user = await Faculty.findById(id);
    let isStudent = false;
    
    if (!user) {
      user = await Student.findById(id);
      isStudent = true;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {
      firstName,
      lastName,
      email
    };

    // Add password if provided
    if (password && password.length >= 6) {
      const bcrypt = require('bcrypt');
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Add additional data based on role
    if (additionalData) {
      if (additionalData.status !== undefined) {
        updateData.active = additionalData.status === 'Active';
      }
      
      if (role === 'faculty') {
        if (additionalData.department) updateData.department = additionalData.department;
        if (additionalData.title) updateData.title = additionalData.title;
      } else if (role === 'student') {
        if (additionalData.grade) updateData.grade = additionalData.grade;
      }
    }

    // Update the user
    let updatedUser;
    if (isStudent) {
      updatedUser = await Student.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      updatedUser = await Faculty.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Return success response without sensitive data
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: isStudent ? 'student' : 'faculty',
        status: updatedUser.active ? 'Active' : 'Inactive'
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update',
      error: error.message
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user first to determine which collection to delete from
    let user = await Faculty.findById(id);
    let isStudent = false;
    
    if (!user) {
      user = await Student.findById(id);
      isStudent = true;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete the user
    if (isStudent) {
      await Student.findByIdAndDelete(id);
    } else {
      await Faculty.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion',
      error: error.message
    });
  }
};
