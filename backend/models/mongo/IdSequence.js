const mongoose = require('mongoose');

const idSequenceSchema = new mongoose.Schema({
  sequenceType: {
    type: String,
    required: true,
    unique: true,
    enum: ['student', 'employee', 'parent', 'course', 'other']
  },
  currentValue: {
    type: Number,
    required: true,
    default: 10000
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  minLength: {
    type: Number,
    default: 5
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'id_sequences'
});

// Create index for efficient querying
idSequenceSchema.index({ sequenceType: 1 }, { unique: true });

// Static method to get next ID in sequence
idSequenceSchema.statics.getNextId = async function(sequenceType) {
  const sequence = await this.findOneAndUpdate(
    { sequenceType },
    { $inc: { currentValue: 1 } },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  
  const nextValue = sequence.currentValue;
  const paddedValue = nextValue.toString().padStart(sequence.minLength, '0');
  
  return `${sequence.prefix}${paddedValue}${sequence.suffix}`;
};

// Static method to initialize sequences
idSequenceSchema.statics.initializeSequences = async function() {
  const sequences = [
    { sequenceType: 'student', currentValue: 10000, description: 'Student ID sequence' },
    { sequenceType: 'employee', currentValue: 10000, description: 'Employee ID sequence' },
    { sequenceType: 'parent', currentValue: 1000, prefix: 'PAR', description: 'Parent ID sequence' },
    { sequenceType: 'course', currentValue: 100, prefix: 'CRS', description: 'Course ID sequence' }
  ];
  
  for (const seq of sequences) {
    await this.findOneAndUpdate(
      { sequenceType: seq.sequenceType },
      seq,
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  
  console.log('ID sequences initialized');
};

module.exports = mongoose.model('IdSequence', idSequenceSchema);
