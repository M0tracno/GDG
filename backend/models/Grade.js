/**
 * Simple Grade Model for Parent Dashboard
 * This provides a simpler grade structure for parent viewing
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  },
  assignmentName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Assignment'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 1
    },
    defaultValue: 100
  },
  letterGrade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gradeDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['studentId', 'subject']
    },
    {
      fields: ['gradeDate']
    }
  ]
});

// Calculate letter grade based on percentage
Grade.beforeSave(async (grade, options) => {
  if (grade.score && grade.maxScore) {
    const percentage = (grade.score / grade.maxScore) * 100;
    
    if (percentage >= 97) grade.letterGrade = 'A+';
    else if (percentage >= 93) grade.letterGrade = 'A';
    else if (percentage >= 90) grade.letterGrade = 'A-';
    else if (percentage >= 87) grade.letterGrade = 'B+';
    else if (percentage >= 83) grade.letterGrade = 'B';
    else if (percentage >= 80) grade.letterGrade = 'B-';
    else if (percentage >= 77) grade.letterGrade = 'C+';
    else if (percentage >= 73) grade.letterGrade = 'C';
    else if (percentage >= 70) grade.letterGrade = 'C-';
    else if (percentage >= 67) grade.letterGrade = 'D+';
    else if (percentage >= 65) grade.letterGrade = 'D';
    else grade.letterGrade = 'F';
  }
});

module.exports = Grade;
