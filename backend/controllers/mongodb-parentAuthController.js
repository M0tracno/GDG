const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Parent, Student, ParentStudentRelation, IdSequence } = require('../models/mongodb-models');

class ParentAuthController {
  /**
   * Get parent profile
   */
  async getProfile(req, res) {
    try {
      const parentId = req.user.parentId;

      const parent = await Parent.findById(parentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      // Get parent's children
      const relations = await ParentStudentRelation.find({ 
        parentId: parent._id,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName classId section');

      const children = relations.map(rel => ({
        studentId: rel.studentId.studentId,
        name: `${rel.studentId.firstName} ${rel.studentId.lastName}`,
        class: rel.studentId.classId,
        section: rel.studentId.section,
        relationship: rel.relationship
      }));

      res.json({
        success: true,
        data: {
          parent: {
            id: parent._id,
            parentId: parent.parentId,
            firstName: parent.firstName,
            lastName: parent.lastName,
            phoneNumber: parent.phoneNumber,
            email: parent.email,
            fullName: parent.fullName,
            lastLogin: parent.lastLogin
          },
          children
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update parent profile
   */
  async updateProfile(req, res) {
    try {
      const parentId = req.user.parentId;
      const { firstName, lastName, email, address, occupation } = req.body;

      const parent = await Parent.findById(parentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      // Update parent information
      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName) updateData.lastName = lastName.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (address) updateData.address = address.trim();
      if (occupation) updateData.occupation = occupation.trim();

      const updatedParent = await Parent.findByIdAndUpdate(
        parentId, 
        updateData, 
        { new: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          parent: {
            id: updatedParent._id,
            parentId: updatedParent.parentId,
            firstName: updatedParent.firstName,
            lastName: updatedParent.lastName,
            phoneNumber: updatedParent.phoneNumber,
            email: updatedParent.email,
            address: updatedParent.address,
            occupation: updatedParent.occupation,
            fullName: updatedParent.fullName
          }
        }
      });    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Logout parent (token blacklisting can be implemented if needed)
   */
  async logout(req, res) {
    try {
      // For JWT tokens, we typically handle logout on the frontend by removing the token
      // Here we can optionally implement token blacklisting if needed
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error during parent logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify student exists (for Firebase authentication)
   */
  async verifyStudent(req, res) {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      // Find student by studentId
      const student = await Student.findOne({ studentId: studentId.toString() });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with the provided Student ID'
        });
      }

      res.json({
        success: true,
        message: 'Student verified',
        data: {
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          class: student.classId,
          section: student.section
        }
      });

    } catch (error) {
      console.error('Verify student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  /**
   * Verify Firebase authentication and login parent
   */
  async verifyFirebaseAuth(req, res) {
    try {
      const { firebaseUid, phoneNumber, studentId } = req.body;

      // Validate input
      if (!firebaseUid || !phoneNumber || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID, phone number, and Student ID are required'
        });
      }

      // Format phone number for consistency
      let formattedPhone;
      try {
        // Remove any spaces and ensure it starts with +91
        formattedPhone = phoneNumber.replace(/\s+/g, '');
        if (!formattedPhone.startsWith('+91')) {
          if (formattedPhone.startsWith('91')) {
            formattedPhone = '+' + formattedPhone;
          } else if (formattedPhone.startsWith('+')) {
            // Already has + but maybe not 91
            formattedPhone = formattedPhone;
          } else {
            // Assume it's an Indian number
            formattedPhone = '+91' + formattedPhone;
          }
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Find student by studentId
      const student = await Student.findOne({ studentId: studentId.toString() });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with the provided Student ID'
        });
      }

      // Find or create parent
      let parent = await Parent.findOne({ phoneNumber: formattedPhone });

      if (!parent) {
        // Create new parent if doesn't exist
        const nextParentId = await IdSequence.getNextId('parent');
        
        parent = new Parent({
          parentId: nextParentId,
          phoneNumber: formattedPhone,
          firstName: 'Parent', // Temporary, can be updated later
          lastName: `${student.firstName}`, // Default naming
          isVerified: true, // Mark as verified since Firebase verified the phone
          firebaseUid: firebaseUid // Store Firebase UID for future reference
        });

        await parent.save();
      } else {
        // Update existing parent with Firebase UID and mark as verified
        await Parent.findByIdAndUpdate(parent._id, {
          isVerified: true,
          lastLogin: new Date(),
          firebaseUid: firebaseUid
        });
      }

      // Check if parent-student relationship exists
      let relationship = await ParentStudentRelation.findOne({
        parentId: parent._id,
        studentId: student._id
      });

      if (!relationship) {
        // Create parent-student relationship
        relationship = new ParentStudentRelation({
          parentId: parent._id,
          studentId: student._id,
          relationship: 'Guardian',
          isActive: true
        });
        
        await relationship.save();
      }

      // Generate JWT token for the application
      const token = jwt.sign(
        {
          parentId: parent._id,
          phoneNumber: parent.phoneNumber,
          firebaseUid: firebaseUid,
          type: 'parent'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Get parent's children
      const relations = await ParentStudentRelation.find({ 
        parentId: parent._id,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName classId section');

      const children = relations.map(rel => ({
        studentId: rel.studentId.studentId,
        name: `${rel.studentId.firstName} ${rel.studentId.lastName}`,
        class: rel.studentId.classId,
        section: rel.studentId.section,
        relationship: rel.relationship
      }));

      res.json({
        success: true,
        message: 'Firebase authentication successful',
        token,
        parent: {
          id: parent._id,
          parentId: parent.parentId,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phoneNumber: parent.phoneNumber,
          email: parent.email,
          fullName: parent.fullName,
          firebaseUid: parent.firebaseUid
        },
        children
      });

    } catch (error) {
      console.error('Firebase authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Traditional email/password login for parents
   */
  async loginWithEmail(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find parent by email and include password for comparison
      const parent = await Parent.findOne({ email: email.toLowerCase() }).select('+password');

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if parent is active
      if (!parent.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Verify password
      const isMatch = await parent.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      parent.lastLogin = new Date();
      await parent.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          parentId: parent._id,
          email: parent.email,
          type: 'parent'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Get parent's children
      const relations = await ParentStudentRelation.find({ 
        parentId: parent._id,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName classId section');

      const children = relations.map(rel => ({
        studentId: rel.studentId.studentId,
        name: `${rel.studentId.firstName} ${rel.studentId.lastName}`,
        class: rel.studentId.classId,
        section: rel.studentId.section,
        relationship: rel.relationship
      }));

      res.json({
        success: true,
        message: 'Login successful',
        token,
        parent: {
          id: parent._id,
          parentId: parent.parentId,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          fullName: parent.fullName
        },
        children
      });

    } catch (error) {
      console.error('Parent email login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Register parent with email and password
   */
  async registerWithEmail(req, res) {
    try {
      const { email, password, firstName, lastName, studentId, phoneNumber } = req.body;

      if (!email || !password || !firstName || !lastName || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, first name, last name, and student ID are required'
        });
      }

      // Check if parent already exists with this email
      const existingParent = await Parent.findOne({ email: email.toLowerCase() });
      if (existingParent) {
        return res.status(400).json({
          success: false,
          message: 'A parent account with this email already exists'
        });
      }

      // Verify student exists
      const student = await Student.findOne({ studentId: studentId.toString() });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with the provided Student ID'
        });
      }

      // Generate parent ID
      const parentIdCounter = await IdSequence.findOneAndUpdate(
        { name: 'parentId' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      const generatedParentId = `PAR${Date.now()}`;

      // Create parent account
      const parent = new Parent({
        parentId: generatedParentId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        isVerified: true, // Email accounts are considered verified upon registration
        isActive: true
      });

      await parent.save();

      // Create parent-student relationship
      const relationship = new ParentStudentRelation({
        parentId: parent._id,
        studentId: student._id,
        relationship: 'Guardian',
        isActive: true
      });
      
      await relationship.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          parentId: parent._id,
          email: parent.email,
          type: 'parent'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Parent account created successfully',
        token,
        parent: {
          id: parent._id,
          parentId: parent.parentId,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          fullName: parent.fullName
        },
        children: [{
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          class: student.classId,
          section: student.section,
          relationship: 'Guardian'
        }]
      });

    } catch (error) {
      console.error('Parent registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ParentAuthController();
