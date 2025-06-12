const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  classId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  facultyId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Faculty',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  // Store schedule as JSON string
  schedule: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('schedule');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('schedule', JSON.stringify(value || {}));
    }
  },
  creditHours: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  // Store course materials as JSON string
  materials: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('materials');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('materials', JSON.stringify(value || []));
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
}, {
  timestamps: true,
});

module.exports = Course; 