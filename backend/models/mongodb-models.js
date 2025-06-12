/**
 * MongoDB models index
 * Exports all MongoDB model definitions
 */
const Faculty = require('./mongo/Faculty');
const Student = require('./mongo/Student');
const Course = require('./mongo/Course');
const Enrollment = require('./mongo/Enrollment');
const Attendance = require('./mongo/Attendance');
const Mark = require('./mongo/Mark');
const PasswordSetupToken = require('./mongo/PasswordSetupToken');
const Parent = require('./mongo/Parent');
const ParentStudentRelation = require('./mongo/ParentStudentRelation');
const Grade = require('./mongo/Grade');
const IdSequence = require('./mongo/IdSequence');
const Message = require('./mongo/Message');

module.exports = {
  Faculty,
  Student,
  Course,
  Enrollment,
  Attendance,
  Mark,
  PasswordSetupToken,
  Parent,
  ParentStudentRelation,
  Grade,
  IdSequence,
  Message
};
