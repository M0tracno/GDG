const mongoose = require('mongoose');

const parentStudentRelationSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian', 'Other'],
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emergencyContact: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'parent_student_relations'
});

// Create compound indexes for efficient querying
parentStudentRelationSchema.index({ parentId: 1, studentId: 1 }, { unique: true });
parentStudentRelationSchema.index({ studentId: 1 });
parentStudentRelationSchema.index({ parentId: 1 });
parentStudentRelationSchema.index({ isActive: 1 });
parentStudentRelationSchema.index({ isPrimary: 1 });

// Pre-save middleware to ensure only one primary contact per student
parentStudentRelationSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    // If setting this as primary, unset other primary relationships for this student
    await this.constructor.updateMany(
      { 
        studentId: this.studentId, 
        _id: { $ne: this._id },
        isPrimary: true 
      },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('ParentStudentRelation', parentStudentRelationSchema);
