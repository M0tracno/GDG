/**
 * MongoDB Controllers Wrapper
 * 
 * This file provides compatibility with both naming conventions
 * by re-exporting controllers with standardized method names.
 */

// Import all controllers with their original method names
const facultyController = require('./facultyController');
const studentController = require('./studentController');
const courseController = require('./courseController');
const enrollmentController = require('./enrollmentController');
const attendanceController = require('./attendanceController');
const markController = require('./markController');

// Map enrollment controller methods to standard CRUD names
const standardizedEnrollmentController = {
  ...enrollmentController,
  // Add standard CRUD method names
  create: enrollmentController.createEnrollment,
  update: enrollmentController.updateEnrollmentStatus,
  delete: async (req, res, next) => {
    try {
      const { Enrollment } = require('../models/mongodb-models');
      const enrollment = await Enrollment.findById(req.params.id);
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }
      
      await enrollment.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Enrollment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = {
  facultyController,
  studentController,
  courseController,
  enrollmentController: standardizedEnrollmentController,
  attendanceController,
  markController
};
