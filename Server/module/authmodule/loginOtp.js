const mongoose = require("mongoose");

const loginOtpSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    resendAvailableAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

loginOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
loginOtpSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("LoginOtp", loginOtpSchema);
