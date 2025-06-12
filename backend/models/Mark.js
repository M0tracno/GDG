const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Individual student mark in an assessment
const MarkRecord = sequelize.define('MarkRecord', {
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
  marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  remarks: {
    type: DataTypes.STRING
  }
});

// Assessment with student marks
const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  assessmentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assessmentType: {
    type: DataTypes.ENUM('quiz', 'assignment', 'project', 'mid_term', 'final_exam', 'lab', 'other'),
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 1
    }
  },
  weightage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'completed'),
    defaultValue: 'draft'
  },
  markedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Faculties',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['courseId', 'assessmentName', 'assessmentType']
    }
  ]
});

// Define the relationship between Mark and MarkRecord
Mark.hasMany(MarkRecord, {
  foreignKey: 'markId',
  as: 'records'
});

MarkRecord.belongsTo(Mark, {
  foreignKey: 'markId',
  as: 'mark'
});

module.exports = {
  Mark,
  MarkRecord
}; 