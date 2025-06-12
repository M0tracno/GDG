const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  assignmentName: {
    type: String,
    required: true,
    trim: true
  },
  assignmentType: {
    type: String,
    enum: ['Quiz', 'Test', 'Assignment', 'Project', 'Lab', 'Homework', 'Midterm', 'Final', 'Other'],
    default: 'Assignment'
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
  },
  gradeDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date
  },
  submittedDate: {
    type: Date
  },
  feedback: {
    type: String,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  isExcused: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'grades'
});

// Create compound indexes for efficient querying
gradeSchema.index({ studentId: 1, subject: 1 });
gradeSchema.index({ gradeDate: -1 });
gradeSchema.index({ studentId: 1, gradeDate: -1 });
gradeSchema.index({ subject: 1, gradeDate: -1 });
gradeSchema.index({ letterGrade: 1 });

// Pre-save middleware to calculate percentage and letter grade
gradeSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.score !== undefined && this.maxScore !== undefined) {
    this.percentage = Math.round((this.score / this.maxScore) * 100 * 100) / 100; // Round to 2 decimal places
  }
  
  // Auto-calculate letter grade based on percentage
  if (this.percentage !== undefined && !this.letterGrade) {
    if (this.percentage >= 97) this.letterGrade = 'A+';
    else if (this.percentage >= 93) this.letterGrade = 'A';
    else if (this.percentage >= 90) this.letterGrade = 'A-';
    else if (this.percentage >= 87) this.letterGrade = 'B+';
    else if (this.percentage >= 83) this.letterGrade = 'B';
    else if (this.percentage >= 80) this.letterGrade = 'B-';
    else if (this.percentage >= 77) this.letterGrade = 'C+';
    else if (this.percentage >= 73) this.letterGrade = 'C';
    else if (this.percentage >= 70) this.letterGrade = 'C-';
    else if (this.percentage >= 67) this.letterGrade = 'D+';
    else if (this.percentage >= 63) this.letterGrade = 'D';
    else if (this.percentage >= 60) this.letterGrade = 'D-';
    else this.letterGrade = 'F';
  }
  
  // Check if assignment was submitted late
  if (this.dueDate && this.submittedDate && this.submittedDate > this.dueDate) {
    this.isLate = true;
  }
  
  next();
});

// Virtual for grade display
gradeSchema.virtual('gradeDisplay').get(function() {
  return `${this.score}/${this.maxScore} (${this.percentage}%) - ${this.letterGrade}`;
});

// Ensure virtual fields are serialized
gradeSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Grade', gradeSchema);
