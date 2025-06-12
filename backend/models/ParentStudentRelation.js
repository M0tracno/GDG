const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParentStudentRelation = sequelize.define('ParentStudentRelation', {
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'parents',
      key: 'parentId'
    }
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'studentId'
    }
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Father',
    validate: {
      isIn: [['Father', 'Mother', 'Guardian', 'Other']]
    }
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this is the primary contact for the student'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'parent_student_relations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['parentId', 'studentId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['parentId']
    }
  ]
});

module.exports = ParentStudentRelation;
