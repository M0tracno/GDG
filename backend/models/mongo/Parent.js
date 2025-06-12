const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const parentSchema = new mongoose.Schema({
  parentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: function() {
      return !this.email; // Phone number is required only if email is not provided
    },
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    index: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  email: {
    type: String,
    required: function() {
      return !this.phoneNumber; // Email is required only if phone number is not provided
    },
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return !!this.email; // Password is required when using email authentication
    },
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  address: {
    type: String,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  relationToStudent: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian', 'Other'],
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  otpHash: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  firebaseUid: {
    type: String,
    sparse: true, // Allow null values but enforce uniqueness when present
    index: true
  }
}, {
  timestamps: true,
  collection: 'parents'
});

// Create indexes for efficient querying
parentSchema.index({ phoneNumber: 1 });
parentSchema.index({ email: 1 });
parentSchema.index({ parentId: 1 });
parentSchema.index({ isActive: 1 });
parentSchema.index({ isVerified: 1 });

// Hash password before saving
parentSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
parentSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
parentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
parentSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Parent', parentSchema);
