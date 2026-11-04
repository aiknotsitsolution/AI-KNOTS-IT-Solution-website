const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
      default: "Unknown browser",
    },
    platform: {
      type: String,
      default: "Unknown device",
    },
    deviceName: {
      type: String,
      default: "Unknown device",
      maxlength: 120,
    },
    userAgent: {
      type: String,
      default: "",
      maxlength: 512,
    },
    lastSeenAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokeReason: {
      type: String,
      default: null,
    },
    purgeAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

userSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });
userSessionSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("UserSession", userSessionSchema);
