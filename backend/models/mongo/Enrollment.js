const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'withdrawn', 'failed'],
    default: 'active'
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', 'I', 'W', 'N/A'],
    default: 'N/A'
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure a student can only be enrolled once in a course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Virtual field for attendance records
EnrollmentSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'enrollment',
  justOne: false
});

// Virtual field for marks/assignments
EnrollmentSchema.virtual('marks', {
  ref: 'Mark',
  localField: '_id',
  foreignField: 'enrollment',
  justOne: false
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
