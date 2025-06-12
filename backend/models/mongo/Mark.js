const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'participation', 'other'],
    default: 'assignment'
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [0, 'Maximum score cannot be negative']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  weight: {
    type: Number,
    default: 1,
    min: [0, 'Weight cannot be negative']
  },
  dueDate: {
    type: Date
  },
  submissionDate: {
    type: Date
  },
  feedback: {
    type: String
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for percentage score
MarkSchema.virtual('percentage').get(function() {
  if (this.maxScore === 0) return 0;
  return Math.round((this.score / this.maxScore) * 100);
});

module.exports = mongoose.model('Mark', MarkSchema);
