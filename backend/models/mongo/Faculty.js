const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FacultySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  title: {
    type: String,
    default: 'Instructor'
  },
  phone: {
    type: String
  },
  bio: {
    type: String
  },
  avatar: {
    type: String
  },  active: {
    type: Boolean,
    default: true
  },  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['faculty', 'admin'],
    default: 'faculty'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full name
FacultySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual field for courses - will populate from Course model
FacultySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'faculty',
  justOne: false
});

// Encrypt password using bcrypt
FacultySchema.pre('save', async function(next) {
  // If password is modified, hash it
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Make sure role is 'admin' when isAdmin is true
  if (this.isModified('isAdmin') && this.isAdmin === true) {
    this.role = 'admin';
  }
  
  next();
});

// Match user entered password to hashed password in database
FacultySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Faculty', FacultySchema);
