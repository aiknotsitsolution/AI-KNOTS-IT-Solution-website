const mongoose = require("mongoose");
const User = require("../../module/authmodule/authmodule");
const UserSession = require("../../module/authmodule/userSession");
const getLoginDevice = require("../../utils/loginDevice");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ROLES = new Set(["admin", "testing"]);
const PUBLIC_USER_FIELDS =
  "_id username email role isActive avatarUrl createdAt updatedAt";
const countActiveAdmins = () =>
  User.countDocuments({
    $and: [
      {
        $or: [
          { role: "admin" },
          { role: { $exists: false } },
          { role: null },
        ],
      },
      {
        $or: [
          { isActive: true },
          { isActive: { $exists: false } },
          { isActive: null },
        ],
      },
    ],
  });

const getUsers = async (req, res, next) => {
  try {
    const [users, sessionCounts] = await Promise.all([
      User.find().select(PUBLIC_USER_FIELDS).sort({ createdAt: -1 }).lean(),
      UserSession.aggregate([
        {
          $match: {
            revokedAt: null,
            expiresAt: { $gt: new Date() },
          },
        },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]),
    ]);
    const activeSessionCounts = new Map(
      sessionCounts.map(({ _id, count }) => [String(_id), count]),
    );

    return res.status(200).json({
      success: true,
      users: users.map((user) => ({
        ...user,
        role: user.role || "admin",
        isActive: user.isActive !== false,
        activeSessionCount: activeSessionCounts.get(String(user._id)) || 0,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const username =
    typeof req.body.username === "string" ? req.body.username.trim() : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const role = req.body.role;

  if (
    !mongoose.isValidObjectId(id) ||
    username.length < 2 ||
    username.length > 60 ||
    !EMAIL_PATTERN.test(email) ||
    !USER_ROLES.has(role)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid name, email, and account role.",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const duplicateEmail = await User.findOne({
      _id: { $ne: user._id },
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    }).select("_id");
    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already used by another account.",
      });
    }

    const isSelf = user._id.equals(req.user._id);
    if (isSelf && user.role !== role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own administrator role.",
      });
    }

    if (
      user.isActive !== false &&
      user.role === "admin" &&
      role !== "admin" &&
      (await countActiveAdmins()) <= 1
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one active administrator must remain.",
      });
    }

    const emailChanged = user.email.toLowerCase() !== email;
    user.username = username;
    user.email = email;
    user.role = role;
    await user.save();

    if (emailChanged) {
      user.emailVerified = false;
      user.emailVerificationOtpAttempts = 0;
      await user.save();
      await User.updateOne(
        { _id: user._id },
        {
          $unset: {
            passwordResetOtpHash: 1,
            passwordResetOtpExpires: 1,
            passwordResetOtpAttempts: 1,
            passwordResetRequestedAt: 1,
            passwordResetVerifiedTokenHash: 1,
            passwordResetVerifiedExpires: 1,
            profilePasswordOtpHash: 1,
            profilePasswordOtpExpires: 1,
            profilePasswordOtpAttempts: 1,
            profilePasswordOtpRequestedAt: 1,
            profilePasswordVerifiedTokenHash: 1,
            profilePasswordVerifiedExpires: 1,
            emailChangeOtpHash: 1,
            emailChangeOtpExpires: 1,
            emailChangeOtpAttempts: 1,
            emailChangeOtpRequestedAt: 1,
            emailChangeOtpStage: 1,
            emailChangePendingEmail: 1,
            emailChangeCurrentVerifiedTokenHash: 1,
            emailChangeCurrentVerifiedExpires: 1,
            emailVerificationOtpHash: 1,
            emailVerificationOtpExpires: 1,
            emailVerificationRequestedAt: 1,
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive !== false,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already used by another account.",
      });
    }
    return next(error);
  }
};

const setUserActive = async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.isValidObjectId(id) || typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "A valid user and active status are required.",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!isActive && user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    if (
      !isActive &&
      user.isActive !== false &&
      user.role === "admin" &&
      (await countActiveAdmins()) <= 1
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one active administrator must remain.",
      });
    }

    user.isActive = isActive;
    await user.save();
    if (!isActive) {
      await UserSession.updateMany(
        { userId: user._id, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(),
            revokeReason: "Account deactivated by an administrator",
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    if (
      user.isActive !== false &&
      user.role === "admin" &&
      (await countActiveAdmins()) <= 1
    ) {
      return res.status(400).json({
        success: false,
        message: "The last active administrator cannot be deleted.",
      });
    }

    await UserSession.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      userId: user._id,
    });
  } catch (error) {
    return next(error);
  }
};

const getUserSessions = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(id).select("_id");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const now = new Date();
    const [sessions, activeCount] = await Promise.all([
      UserSession.find({
        userId: user._id,
        revokedAt: null,
        expiresAt: { $gt: now },
        purgeAt: { $gt: now },
      })
        .select(
          "sessionId deviceType browser platform deviceName userAgent lastSeenAt expiresAt revokedAt revokeReason createdAt",
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      UserSession.countDocuments({
        userId: user._id,
        revokedAt: null,
        expiresAt: { $gt: now },
      }),
    ]);

    return res.status(200).json({
      success: true,
      sessions: sessions.map((session) => ({
        ...session,
        deviceName:
          session.deviceName || getLoginDevice(session.userAgent).deviceName,
        isActive: !session.revokedAt && session.expiresAt > now,
      })),
      activeCount,
    });
  } catch (error) {
    return next(error);
  }
};

const revokeUserSession = async (req, res, next) => {
  const { id, sessionId } = req.params;
  if (!mongoose.isValidObjectId(id) || !/^[a-f0-9]{64}$/i.test(sessionId)) {
    return res.status(400).json({
      success: false,
      message: "A valid user and login session are required.",
    });
  }

  try {
    const result = await UserSession.updateOne(
      {
        userId: id,
        sessionId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          revokedAt: new Date(),
          revokeReason: "Logged out by an administrator",
        },
      },
    );
    if (result.modifiedCount !== 1) {
      return res.status(404).json({
        success: false,
        message: "This login session is no longer active.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device logged out successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

const revokeAllUserSessions = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(id).select("_id");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const result = await UserSession.updateMany(
      {
        userId: user._id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          revokedAt: new Date(),
          revokeReason: "All devices logged out by an administrator",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message:
        result.modifiedCount === 1
          ? "Device logged out successfully."
          : `${result.modifiedCount} devices logged out successfully.`,
      revokedCount: result.modifiedCount,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  updateUser,
  setUserActive,
  deleteUser,
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
};
