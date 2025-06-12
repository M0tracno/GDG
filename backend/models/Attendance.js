const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Attendance Record model for individual student attendance
const AttendanceRecord = sequelize.define('AttendanceRecord', {
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
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    defaultValue: 'absent'
  },
  remarks: {
    type: DataTypes.STRING
  }
});

// Attendance Session model
const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  markedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Faculties',
      key: 'id'
    }
  },
  topic: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['courseId', 'date']
    }
  ]
});

// Define the relationship between Attendance and AttendanceRecord
Attendance.hasMany(AttendanceRecord, {
  foreignKey: 'attendanceId',
  as: 'records'
});

AttendanceRecord.belongsTo(Attendance, {
  foreignKey: 'attendanceId',
  as: 'attendance'
});

module.exports = {
  Attendance,
  AttendanceRecord
}; 