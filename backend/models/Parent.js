const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parent = sequelize.define('Parent', {
  parentId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING,
  },
  occupation: {
    type: DataTypes.STRING,
  },
  relationToStudent: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Father'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  // For OTP verification
  otpHash: {
    type: DataTypes.STRING,
  },
  otpExpiry: {
    type: DataTypes.DATE,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'parents',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['phoneNumber']
    },
    {
      fields: ['parentId']
    }
  ]
});

module.exports = Parent;
