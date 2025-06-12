/**
 * Controllers index file
 * Exports all controllers
 */
const facultyController = require('./facultyController');
const studentController = require('./studentController');
const courseController = require('./courseController');
const enrollmentController = require('./enrollmentController');
const attendanceController = require('./attendanceController');
const markController = require('./markController');

module.exports = {
  facultyController,
  studentController,
  courseController,
  enrollmentController,
  attendanceController,
  markController
};
