const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const IdSequence = require('./IdSequence');

const Faculty = sequelize.define('Faculty', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    defaultValue: 'Assistant Professor'
  },
  specialization: {
    type: DataTypes.STRING,
  },
  // Store as JSON string in SQLite
  qualifications: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('qualifications');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('qualifications', JSON.stringify(value || []));
    }
  },
  contactNumber: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  profilePictureUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
}, {
  // Add timestamps (createdAt, updatedAt)
  timestamps: true,
});

// Hook to generate Employee ID before creation
Faculty.beforeCreate(async (faculty, options) => {
  if (!faculty.employeeId) {
    faculty.employeeId = await IdSequence.getNextId('EMPLOYEE');
  }
});

// Add instance method for fullName
Faculty.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = Faculty; 