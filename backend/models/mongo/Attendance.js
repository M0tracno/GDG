const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure only one attendance record per enrollment per date
AttendanceSchema.index({ enrollment: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
