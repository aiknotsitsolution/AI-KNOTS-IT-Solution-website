const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const User = require("../../module/authmodule/authmodule");
const transporter = require("../config/mail");
const imagekit = require("../../utils/imagekit");

const PROFILE_OTP_TTL_MS = 60 * 1000;
const PROFILE_OTP_COOLDOWN_MS = 60 * 1000;
const PROFILE_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const PROFILE_OTP_MAX_ATTEMPTS = 5;
const EMAIL_CHANGE_OTP_TTL_MS = 60 * 1000;
const EMAIL_CHANGE_COOLDOWN_MS = 60 * 1000;
const EMAIL_CHANGE_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const EMAIL_CHANGE_MAX_ATTEMPTS = 5;

const hashOtp = (otp) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET || "mysecretkey")
    .update(otp)
    .digest("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getProfile = (req, res) =>
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role || "admin",
      avatarUrl: req.user.avatarUrl || null,
      createdAt: req.user.createdAt,
    },
  });

const updateProfile = async (req, res) => {
  const username =
    typeof req.body.username === "string" ? req.body.username.trim() : "";

  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 2 and 50 characters.",
    });
  }

  try {
    const duplicate = await User.findOne({
      username,
      _id: { $ne: req.user._id },
    }).select("_id");

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username is already in use.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { username } },
      {
        new: true,
        runValidators: true,
        select: "_id username email role avatarUrl createdAt",
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "admin",
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That username is already in use.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to update your profile right now.",
    });
  }
};

const clearEmailChangeOtp = (userId, otpHash) =>
  User.updateOne(
    { _id: userId, emailChangeOtpHash: otpHash },
    {
      $unset: {
        emailChangeOtpHash: 1,
        emailChangeOtpExpires: 1,
        emailChangeOtpAttempts: 1,
        emailChangeOtpRequestedAt: 1,
        emailChangeOtpStage: 1,
        emailChangePendingEmail: 1,
      },
    },
  );

const sendEmailChangeOtp = async (email, otp, stage) =>
  transporter.sendMail({
    from: `"AI Knots IT" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your AI Knots Admin email verification code",
    text: `Your email change verification code is ${otp}. It expires in 1 minute. If you did not request this, you can ignore this email.`,
    html: `<p>Your AI Knots Admin email change verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code verifies your ${stage === "current" ? "current account email" : "new email address"} and expires in 1 minute.</p>`,
  });

const requestCurrentEmailOtp = async (req, res) => {
  const now = Date.now();
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashOtp(otp);

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        $or: [
          { emailChangeOtpRequestedAt: null },
          { emailChangeOtpRequestedAt: { $exists: false } },
          {
            emailChangeOtpRequestedAt: {
              $lte: new Date(now - EMAIL_CHANGE_COOLDOWN_MS),
            },
          },
        ],
      },
      {
        $set: {
          emailChangeOtpHash: otpHash,
          emailChangeOtpExpires: new Date(now + EMAIL_CHANGE_OTP_TTL_MS),
          emailChangeOtpAttempts: 0,
          emailChangeOtpRequestedAt: new Date(now),
          emailChangeOtpStage: "current",
          emailChangePendingEmail: req.user.email,
          emailChangeCurrentVerifiedTokenHash: null,
          emailChangeCurrentVerifiedExpires: null,
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another code.",
      });
    }

    try {
      await sendEmailChangeOtp(user.email, otp, "current");
    } catch (mailError) {
      await clearEmailChangeOtp(user._id, otpHash);
      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message: `A verification code was sent to ${user.email}. It expires in 1 minute.`,
      expiresIn: EMAIL_CHANGE_OTP_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("Current email verification send error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send a verification code to your current email.",
    });
  }
};

const verifyCurrentEmailOtp = async (req, res) => {
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter the 6-digit verification code.",
    });
  }

  try {
    const now = new Date();
    const currentVerificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        emailChangeOtpStage: "current",
        emailChangePendingEmail: req.user.email,
        emailChangeOtpHash: hashOtp(otp),
        emailChangeOtpExpires: { $gt: now },
        emailChangeOtpAttempts: { $lt: EMAIL_CHANGE_MAX_ATTEMPTS },
      },
      {
        $set: {
          emailChangeOtpStage: "current-verified",
          emailChangeOtpAttempts: 0,
          emailChangeCurrentVerifiedTokenHash: hashToken(
            currentVerificationToken,
          ),
          emailChangeCurrentVerifiedExpires: new Date(
            Date.now() + EMAIL_CHANGE_VERIFICATION_TTL_MS,
          ),
        },
        $unset: {
          emailChangeOtpHash: 1,
          emailChangeOtpExpires: 1,
          emailChangePendingEmail: 1,
        },
      },
      { new: true },
    );

    if (!user) {
      await User.updateOne(
        {
          _id: req.user._id,
          emailChangeOtpStage: "current",
          emailChangeOtpHash: { $exists: true, $ne: null },
          emailChangeOtpExpires: { $gt: now },
          emailChangeOtpAttempts: { $lt: EMAIL_CHANGE_MAX_ATTEMPTS },
        },
        { $inc: { emailChangeOtpAttempts: 1 } },
      );
      return res.status(400).json({
        success: false,
        message: "The code is invalid or expired. Request a new code and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current email verified. Now verify your new email address.",
      currentVerificationToken,
    });
  } catch (error) {
    console.error("Current email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify your current email right now.",
    });
  }
};

const requestNewEmailOtp = async (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const currentVerificationToken =
    typeof req.body.currentVerificationToken === "string"
      ? req.body.currentVerificationToken
      : "";

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[a-f0-9]{64}$/i.test(currentVerificationToken)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid new email address and verify your current email first.",
    });
  }

  if (email.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: "Enter an email address different from your current email.",
    });
  }

  try {
    const verificationHash = hashToken(currentVerificationToken);
    const verifiedUser = await User.findOne({
      _id: req.user._id,
      emailChangeCurrentVerifiedTokenHash: verificationHash,
      emailChangeCurrentVerifiedExpires: { $gt: new Date() },
    }).select("_id email emailChangeOtpStage emailChangeOtpRequestedAt");

    if (!verifiedUser) {
      return res.status(400).json({
        success: false,
        message: "Current email verification expired. Start the email change again.",
      });
    }

    const existingUser = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("_id");

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "That email address is already associated with an account.",
      });
    }

    const now = Date.now();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otp);
    const cooldownDate = new Date(now - EMAIL_CHANGE_COOLDOWN_MS);
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        emailChangeCurrentVerifiedTokenHash: verificationHash,
        emailChangeCurrentVerifiedExpires: { $gt: new Date(now) },
        $or: [
          { emailChangeOtpStage: "current-verified" },
          {
            emailChangeOtpStage: "new",
            emailChangeOtpRequestedAt: { $lte: cooldownDate },
          },
          {
            emailChangeOtpStage: "new",
            emailChangeOtpRequestedAt: null,
          },
          {
            emailChangeOtpStage: "new",
            emailChangeOtpRequestedAt: { $exists: false },
          },
        ],
      },
      {
        $set: {
          emailChangeOtpHash: otpHash,
          emailChangeOtpExpires: new Date(now + EMAIL_CHANGE_OTP_TTL_MS),
          emailChangeOtpAttempts: 0,
          emailChangeOtpRequestedAt: new Date(now),
          emailChangeOtpStage: "new",
          emailChangePendingEmail: email,
        },
      },
      { new: true },
    );

    if (!user) {
      const currentVerificationIsValid = await User.exists({
        _id: req.user._id,
        emailChangeCurrentVerifiedTokenHash: verificationHash,
        emailChangeCurrentVerifiedExpires: { $gt: new Date() },
      });

      if (!currentVerificationIsValid) {
        return res.status(400).json({
          success: false,
          message:
            "Current email verification expired. Start the email change again.",
        });
      }

      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another code.",
      });
    }

    try {
      await sendEmailChangeOtp(email, otp, "new");
    } catch (mailError) {
      await User.updateOne(
        { _id: user._id, emailChangeOtpHash: otpHash },
        {
          $set: {
            emailChangeOtpStage: "current-verified",
            emailChangeOtpRequestedAt: null,
          },
          $unset: {
            emailChangeOtpHash: 1,
            emailChangeOtpExpires: 1,
            emailChangeOtpAttempts: 1,
            emailChangePendingEmail: 1,
          },
        },
      );
      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message: `A verification code was sent to ${email}. It expires in 1 minute.`,
      expiresIn: EMAIL_CHANGE_OTP_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("New email verification send error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send a verification code to your new email.",
    });
  }
};

const verifyNewEmailOtp = async (req, res) => {
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter the 6-digit verification code.",
    });
  }

  try {
    const now = new Date();
    const verificationQuery = {
      _id: req.user._id,
      emailChangeOtpStage: "new",
      emailChangeCurrentVerifiedExpires: { $gt: now },
      emailChangeOtpHash: hashOtp(otp),
      emailChangeOtpExpires: { $gt: now },
      emailChangeOtpAttempts: { $lt: EMAIL_CHANGE_MAX_ATTEMPTS },
      emailChangePendingEmail: { $type: "string" },
    };
    const verifiedRequest = await User.findOne(verificationQuery).select(
      "emailChangePendingEmail",
    );

    if (!verifiedRequest) {
      await User.updateOne(
        {
          _id: req.user._id,
          emailChangeOtpStage: "new",
          emailChangeOtpHash: { $exists: true, $ne: null },
          emailChangeOtpExpires: { $gt: now },
          emailChangeOtpAttempts: { $lt: EMAIL_CHANGE_MAX_ATTEMPTS },
        },
        { $inc: { emailChangeOtpAttempts: 1 } },
      );
      return res.status(400).json({
        success: false,
        message: "The code is invalid or expired. Request a new code and try again.",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        ...verificationQuery,
        emailChangePendingEmail: verifiedRequest.emailChangePendingEmail,
      },
      {
        $set: { email: verifiedRequest.emailChangePendingEmail },
        $unset: {
          emailChangeOtpHash: 1,
          emailChangeOtpExpires: 1,
          emailChangeOtpAttempts: 1,
          emailChangeOtpRequestedAt: 1,
          emailChangeOtpStage: 1,
          emailChangePendingEmail: 1,
          emailChangeCurrentVerifiedTokenHash: 1,
          emailChangeCurrentVerifiedExpires: 1,
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
        },
      },
      { new: true, select: "_id username email role avatarUrl createdAt" },
    );

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "Email change could not be completed. Request a new code and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login email updated successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "admin",
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("New email verification error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email address is already associated with an account.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to update your login email right now.",
    });
  }
};

const uploadProfileAvatar = async (req, res) => {
  const file = req.files?.avatar;
  const avatarFile = Array.isArray(file) ? file[0] : file;

  if (!avatarFile) {
    return res.status(400).json({
      success: false,
      message: "Choose an image to upload.",
    });
  }

  if (avatarFile.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: "Profile images must be 5 MB or smaller.",
    });
  }

  const signatures = {
    "image/jpeg": (data) =>
      data.length >= 3 &&
      data[0] === 0xff &&
      data[1] === 0xd8 &&
      data[2] === 0xff,
    "image/png": (data) =>
      data.length >= 8 &&
      data.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    "image/webp": (data) =>
      data.length >= 12 &&
      data.toString("ascii", 0, 4) === "RIFF" &&
      data.toString("ascii", 8, 12) === "WEBP",
  };
  const signatureMatches = signatures[avatarFile.mimetype];

  if (!signatureMatches || !signatureMatches(avatarFile.data)) {
    return res.status(400).json({
      success: false,
      message: "Upload a valid JPEG, PNG, or WebP image.",
    });
  }

  let uploadedFileId;
  try {
    const uploaded = await imagekit.upload({
      file: avatarFile.data.toString("base64"),
      fileName: `admin-${req.user._id}-${Date.now()}`,
      folder: "/admin-profiles",
      useUniqueFileName: true,
    });
    uploadedFileId = uploaded.fileId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarUrl: uploaded.url } },
      { new: true, select: "_id username email avatarUrl" },
    );

    if (!user) {
      await imagekit.deleteFile(uploaded.fileId);
      return res.status(404).json({
        success: false,
        message: "Admin account was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "admin",
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        await imagekit.deleteFile(uploadedFileId);
      } catch (cleanupError) {
        console.error("Failed to clean up an unused profile image:", cleanupError);
      }
    }
    console.error("Profile photo upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update your profile photo right now.",
    });
  }
};

const requestPasswordChangeOtp = async (req, res) => {
  const now = Date.now();
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashOtp(otp);

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        $or: [
          { profilePasswordOtpRequestedAt: null },
          { profilePasswordOtpRequestedAt: { $exists: false } },
          {
            profilePasswordOtpRequestedAt: {
              $lte: new Date(now - PROFILE_OTP_COOLDOWN_MS),
            },
          },
        ],
      },
      {
        $set: {
          profilePasswordOtpHash: otpHash,
          profilePasswordOtpExpires: new Date(now + PROFILE_OTP_TTL_MS),
          profilePasswordOtpAttempts: 0,
          profilePasswordVerifiedTokenHash: null,
          profilePasswordVerifiedExpires: null,
          profilePasswordOtpRequestedAt: new Date(now),
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another code.",
      });
    }

    try {
      await transporter.sendMail({
        from: `"AI Knots IT" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your AI Knots Admin password change code",
        text: `Your password change verification code is ${otp}. It expires in 1 minute. If you did not request this, you can ignore this email.`,
        html: `<p>Your AI Knots Admin password change verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 1 minute. If you did not request this, you can ignore this email.</p>`,
      });
    } catch (mailError) {
      await User.updateOne(
        { _id: user._id, profilePasswordOtpHash: otpHash },
        {
          $unset: {
            profilePasswordOtpHash: 1,
            profilePasswordOtpExpires: 1,
            profilePasswordOtpRequestedAt: 1,
            profilePasswordVerifiedTokenHash: 1,
            profilePasswordVerifiedExpires: 1,
          },
          $set: { profilePasswordOtpAttempts: 0 },
        },
      );
      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message: `A verification code was sent to ${user.email}. It expires in 1 minute.`,
      expiresIn: PROFILE_OTP_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("Profile password OTP email error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send the verification code right now.",
    });
  }
};

const verifyPasswordChangeOtp = async (req, res) => {
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter the 6-digit verification code.",
    });
  }

  try {
    const now = new Date();
    const otpHash = hashOtp(otp);
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        profilePasswordOtpHash: otpHash,
        profilePasswordOtpExpires: { $gt: now },
        profilePasswordOtpAttempts: { $lt: PROFILE_OTP_MAX_ATTEMPTS },
      },
      {
        $set: { profilePasswordOtpAttempts: 0 },
        $unset: {
          profilePasswordOtpHash: 1,
          profilePasswordOtpExpires: 1,
        },
      },
      { new: true },
    );

    if (!user) {
      await User.updateOne(
        {
          _id: req.user._id,
          profilePasswordOtpHash: { $exists: true, $ne: null },
          profilePasswordOtpExpires: { $gt: now },
          profilePasswordOtpAttempts: { $lt: PROFILE_OTP_MAX_ATTEMPTS },
        },
        { $inc: { profilePasswordOtpAttempts: 1 } },
      );

      return res.status(400).json({
        success: false,
        message: "The code is invalid or expired. Request a new code and try again.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const verifiedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          profilePasswordVerifiedTokenHash: verificationTokenHash,
          profilePasswordVerifiedExpires: new Date(
            Date.now() + PROFILE_VERIFICATION_TTL_MS,
          ),
        },
      },
      { new: true, select: "_id" },
    );

    if (!verifiedUser) {
      return res.status(404).json({
        success: false,
        message: "Admin account was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Code verified. You can now set a new password.",
      verificationToken,
    });
  } catch (error) {
    console.error("Profile password OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify the code right now.",
    });
  }
};

const changePassword = async (req, res) => {
  const { verificationToken, password, confirmPassword } = req.body;

  if (
    typeof verificationToken !== "string" ||
    !/^[a-f0-9]{64}$/i.test(verificationToken) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128 ||
    typeof confirmPassword !== "string" ||
    confirmPassword !== password
  ) {
    return res.status(400).json({
      success: false,
      message:
        confirmPassword !== password
          ? "Passwords do not match."
          : "Verify your email and enter a password between 8 and 128 characters.",
    });
  }

  try {
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        profilePasswordVerifiedTokenHash: verificationTokenHash,
        profilePasswordVerifiedExpires: { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          profilePasswordOtpHash: 1,
          profilePasswordOtpExpires: 1,
          profilePasswordOtpAttempts: 1,
          profilePasswordOtpRequestedAt: 1,
          profilePasswordVerifiedTokenHash: 1,
          profilePasswordVerifiedExpires: 1,
        },
      },
      { new: true, select: "_id" },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your verification expired. Request a new code and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your password was changed successfully.",
    });
  } catch (error) {
    console.error("Profile password change error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to change your password right now.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  requestCurrentEmailOtp,
  verifyCurrentEmailOtp,
  requestNewEmailOtp,
  verifyNewEmailOtp,
  uploadProfileAvatar,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword,
};
