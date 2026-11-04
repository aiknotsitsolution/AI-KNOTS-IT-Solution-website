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
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: true
  },
  emailVerificationOtpHash: {
    type: String,
    default: null
  },
  emailVerificationOtpExpires: {
    type: Date,
    default: null
  },
  emailVerificationOtpAttempts: {
    type: Number,
    default: 0
  },
  emailVerificationRequestedAt: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'testing'],
    trim: true,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatarUrl: {
    type: String,
    default: null
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
  profilePasswordOtpHash: {
    type: String,
    default: null
  },
  profilePasswordOtpExpires: {
    type: Date,
    default: null
  },
  profilePasswordOtpAttempts: {
    type: Number,
    default: 0
  },
  profilePasswordOtpRequestedAt: {
    type: Date,
    default: null
  },
  profilePasswordVerifiedTokenHash: {
    type: String,
    default: null
  },
  profilePasswordVerifiedExpires: {
    type: Date,
    default: null
  },
  emailChangeOtpHash: {
    type: String,
    default: null
  },
  emailChangeOtpExpires: {
    type: Date,
    default: null
  },
  emailChangeOtpAttempts: {
    type: Number,
    default: 0
  },
  emailChangeOtpRequestedAt: {
    type: Date,
    default: null
  },
  emailChangeOtpStage: {
    type: String,
    default: null
  },
  emailChangePendingEmail: {
    type: String,
    default: null
  },
  emailChangeCurrentVerifiedTokenHash: {
    type: String,
    default: null
  },
  emailChangeCurrentVerifiedExpires: {
    type: Date,
    default: null
  },
}, { timestamps: true });

// 👇 VERY IMPORTANT
module.exports = mongoose.model('User', userSchema);
