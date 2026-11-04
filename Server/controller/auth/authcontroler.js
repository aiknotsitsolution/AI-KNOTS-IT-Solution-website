const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const User = require('../../module/authmodule/authmodule');
const transporter = require('../config/mail');

const PASSWORD_RESET_OTP_TTL_MS = 60 * 1000;
const PASSWORD_RESET_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_MAX_OTP_ATTEMPTS = 5;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hashResetOtp = (otp) => crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'mysecretkey')
  .update(otp)
  .digest('hex');

// REGISTER USER
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const requestPasswordReset = async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid email address'
    });
  }

  try {
    const user = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
    });
    const genericMessage = 'If an account exists for this email, a verification code will be sent.';

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const now = Date.now();
    if (
      user.passwordResetRequestedAt &&
      now - user.passwordResetRequestedAt.getTime() < PASSWORD_RESET_COOLDOWN_MS
    ) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashResetOtp(otp);
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        $or: [
          { passwordResetRequestedAt: null },
          {
            passwordResetRequestedAt: {
              $lte: new Date(now - PASSWORD_RESET_COOLDOWN_MS),
            },
          },
        ],
      },
      {
        $set: {
          passwordResetOtpHash: otpHash,
          passwordResetOtpExpires: new Date(now + PASSWORD_RESET_OTP_TTL_MS),
          passwordResetOtpAttempts: 0,
          passwordResetVerifiedTokenHash: null,
          passwordResetVerifiedExpires: null,
          passwordResetRequestedAt: new Date(now),
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    try {
      await transporter.sendMail({
        from: `"AI Knots IT" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your AI Knots Admin password reset code',
        text: `Your password reset verification code is ${otp}. It expires in 1 minute. If you did not request this, you can ignore this email.`,
        html: `<p>Your AI Knots Admin password reset verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 1 minute. If you did not request this, you can ignore this email.</p>`,
      });
    } catch (mailError) {
      await User.updateOne(
        { _id: user._id, passwordResetOtpHash: otpHash },
        {
          $unset: {
            passwordResetOtpHash: 1,
            passwordResetOtpExpires: 1,
            passwordResetVerifiedTokenHash: 1,
            passwordResetVerifiedExpires: 1,
            passwordResetRequestedAt: 1,
          },
          $set: { passwordResetOtpAttempts: 0 },
        },
      );
      throw mailError;
    }

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('Password reset email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send a password reset email right now. Please try again later.',
    });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';
  const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Enter the email address and 6-digit code',
    });
  }

  try {
    const user = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
      passwordResetOtpHash: hashResetOtp(otp),
      passwordResetOtpExpires: { $gt: new Date() },
      passwordResetOtpAttempts: { $lt: PASSWORD_RESET_MAX_OTP_ATTEMPTS },
    });

    if (!user) {
      await User.updateOne(
        {
          email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
          passwordResetOtpHash: { $exists: true, $ne: null },
          passwordResetOtpExpires: { $gt: new Date() },
          passwordResetOtpAttempts: { $lt: PASSWORD_RESET_MAX_OTP_ATTEMPTS },
        },
        { $inc: { passwordResetOtpAttempts: 1 } },
      );

      return res.status(400).json({
        success: false,
        message: 'The code is invalid or expired. Request a new code and try again.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        passwordResetOtpHash: hashResetOtp(otp),
        passwordResetOtpExpires: { $gt: new Date() },
        passwordResetOtpAttempts: { $lt: PASSWORD_RESET_MAX_OTP_ATTEMPTS },
      },
      {
        $set: {
          passwordResetVerifiedTokenHash: resetTokenHash,
          passwordResetVerifiedExpires: new Date(Date.now() + PASSWORD_RESET_VERIFICATION_TTL_MS),
          passwordResetOtpAttempts: 0,
        },
        $unset: {
          passwordResetOtpHash: 1,
          passwordResetOtpExpires: 1,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'The code is invalid or expired. Request a new code and try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Code verified. You can now set a new password.',
      resetToken,
    });
  } catch (error) {
    console.error('Password reset OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify the code right now. Please try again later.',
    });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, password, confirmPassword } = req.body;

  if (
    typeof resetToken !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(resetToken) ||
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128 ||
    typeof confirmPassword !== 'string' ||
    confirmPassword !== password
  ) {
    return res.status(400).json({
      success: false,
      message: confirmPassword !== password
        ? 'Passwords do not match'
        : 'A verified reset session and a password of 8 to 128 characters are required',
    });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      {
        passwordResetVerifiedTokenHash: tokenHash,
        passwordResetVerifiedExpires: { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          passwordResetOtpHash: 1,
          passwordResetOtpExpires: 1,
          passwordResetVerifiedTokenHash: 1,
          passwordResetVerifiedExpires: 1,
          passwordResetRequestedAt: 1,
          passwordResetOtpAttempts: 1,
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Your verification has expired. Request a new code and try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to reset your password right now. Please try again later.',
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
};
