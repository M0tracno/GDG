const mongoose = require('mongoose');

/**
 * Schema for password setup tokens
 */
const passwordSetupTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['faculty', 'student', 'admin'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Token expires after 24 hours (in seconds)
  }
});

const PasswordSetupToken = mongoose.model('PasswordSetupToken', passwordSetupTokenSchema);

module.exports = PasswordSetupToken;
