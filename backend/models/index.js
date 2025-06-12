const { sequelize } = require('../config/database');
const Faculty = require('./Faculty');
const Student = require('./Student');
const Course = require('./Course');
const { Mark, MarkRecord } = require('./Mark');
const Grade = require('./Grade');
const Parent = require('./Parent');
const ParentStudentRelation = require('./ParentStudentRelation');
const IdSequence = require('./IdSequence');

// Define associations between models
Faculty.hasMany(Course, {
  foreignKey: 'facultyId',
  as: 'courses'
});

Course.belongsTo(Faculty, {
  foreignKey: 'facultyId',
  as: 'faculty'
});

// Parent-Student Relationship associations
ParentStudentRelation.belongsTo(Parent, {
  foreignKey: 'parentId',
  as: 'parent'
});

ParentStudentRelation.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

Parent.hasMany(ParentStudentRelation, {
  foreignKey: 'parentId',
  as: 'studentRelations'
});

Student.hasMany(ParentStudentRelation, {
  foreignKey: 'studentId',
  as: 'parentRelations'
});

// Grade associations
Grade.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

Student.hasMany(Grade, {
  foreignKey: 'studentId',
  as: 'grades'
});

// Export models
module.exports = {
  sequelize,
  Faculty,
  Student,
  Course,
  Mark,
  MarkRecord,
  Grade,
  Parent,
  ParentStudentRelation,
  IdSequence
}; 