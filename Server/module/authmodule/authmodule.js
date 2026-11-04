const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  passwordResetOtpHash: {
    type: String,
    default: null
  },
  passwordResetOtpExpires: {
    type: Date,
    default: null
  },
  passwordResetOtpAttempts: {
    type: Number,
    default: 0
  },
  passwordResetRequestedAt: {
    type: Date,
    default: null
  },
  passwordResetVerifiedTokenHash: {
    type: String,
    default: null
  },
  passwordResetVerifiedExpires: {
    type: Date,
    default: null
  },
}, { timestamps: true });

// 👇 VERY IMPORTANT
module.exports = mongoose.model('User', userSchema);
