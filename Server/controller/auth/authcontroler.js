const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const User = require('../../module/authmodule/authmodule');
const UserSession = require('../../module/authmodule/userSession');
const LoginOtp = require('../../module/authmodule/loginOtp');
const getLoginDevice = require('../../utils/loginDevice');
const transporter = require('../config/mail');

const PASSWORD_RESET_OTP_TTL_MS = 60 * 1000;
const PASSWORD_RESET_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_MAX_OTP_ATTEMPTS = 5;
const EMAIL_VERIFICATION_OTP_TTL_MS = 60 * 1000;
const EMAIL_VERIFICATION_COOLDOWN_MS = 60 * 1000;
const EMAIL_VERIFICATION_MAX_OTP_ATTEMPTS = 5;
const LOGIN_OTP_TTL_MS = 60 * 1000;
const LOGIN_OTP_CHALLENGE_TTL_MS = 10 * 60 * 1000;
const LOGIN_OTP_COOLDOWN_MS = 60 * 1000;
const LOGIN_OTP_MAX_ATTEMPTS = 5;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hashResetOtp = (otp) => crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'mysecretkey')
  .update(otp)
  .digest('hex');
const hashEmailVerificationOtp = (otp) => crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'mysecretkey')
  .update(`email-verification:${otp}`)
  .digest('hex');
const hashLoginOtp = (challengeId, otp) => crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'mysecretkey')
  .update(`login:${challengeId}:${otp}`)
  .digest('hex');
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendLoginOtpEmail = async (email, otp) =>
  transporter.sendMail({
    from: `"AI Knots IT" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your AI Knots sign-in code",
    text: `Your AI Knots sign-in code is ${otp}. It expires in 1 minute. If you did not try to sign in, you can ignore this email.`,
    html: `<p>Use this one-time code to finish signing in to AI Knots IT:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 1 minute. If you did not try to sign in, you can ignore this email.</p>`,
  });

const issueEmailVerificationOtp = async (user) => {
  const now = Date.now();
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashEmailVerificationOtp(otp);
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      emailVerified: { $ne: true },
      $or: [
        { emailVerificationRequestedAt: null },
        { emailVerificationRequestedAt: { $exists: false } },
        {
          emailVerificationRequestedAt: {
            $lte: new Date(now - EMAIL_VERIFICATION_COOLDOWN_MS),
          },
        },
      ],
    },
    {
      $set: {
        emailVerificationOtpHash: otpHash,
        emailVerificationOtpExpires: new Date(now + EMAIL_VERIFICATION_OTP_TTL_MS),
        emailVerificationOtpAttempts: 0,
        emailVerificationRequestedAt: new Date(now),
      },
    },
    { new: true },
  );

  if (!updatedUser) return null;

  try {
    await transporter.sendMail({
      from: `"AI Knots IT" <${process.env.EMAIL_USER}>`,
      to: updatedUser.email,
      subject: "Verify your AI Knots account",
      text: `Your AI Knots email verification code is ${otp}. It expires in 1 minute. If you did not create this account, you can ignore this email.`,
      html: `<p>Use this code to verify your AI Knots account:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 1 minute. If you did not create this account, you can ignore this email.</p>`,
    });
  } catch (mailError) {
    await User.updateOne(
      { _id: updatedUser._id, emailVerificationOtpHash: otpHash },
      {
        $unset: {
          emailVerificationOtpHash: 1,
          emailVerificationOtpExpires: 1,
          emailVerificationRequestedAt: 1,
        },
        $set: { emailVerificationOtpAttempts: 0 },
      },
    );
    throw mailError;
  }

  return {
    expiresAt: updatedUser.emailVerificationOtpExpires,
    resendAvailableAt: new Date(
      updatedUser.emailVerificationRequestedAt.getTime() +
        EMAIL_VERIFICATION_COOLDOWN_MS,
    ),
  };
};

// REGISTER USER
const registerUser = async (req, res) => {
  const username = typeof req.body.username === 'string'
    ? req.body.username.trim()
    : '';
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';
  const role = req.body.role;
  const { password } = req.body;

  try {
    if (
      username.length < 2 ||
      username.length > 60 ||
      !isValidEmail(email) ||
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 128 ||
      !['admin', 'testing'].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a name, valid email, password between 8 and 128 characters, and a valid role.',
      });
    }

    const existingUser = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: existingUser.emailVerified === false
          ? 'EMAIL_NOT_VERIFIED'
          : 'EMAIL_ALREADY_REGISTERED',
        message: existingUser.emailVerified === false
          ? 'This email is registered but not verified. Verify it to continue.'
          : 'Email already registered',
        email: existingUser.emailVerified === false ? existingUser.email : undefined,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      emailVerified: false,
    });

    try {
      const verification = await issueEmailVerificationOtp(newUser);
      if (!verification) {
        return res.status(409).json({
          success: false,
          message: 'Unable to start email verification. Please try again.',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Account created. Enter the verification code sent to your email.',
        email: newUser.email,
        expiresAt: verification.expiresAt,
        resendAvailableAt: verification.resendAvailableAt,
      });
    } catch (mailError) {
      console.error('Registration verification email error:', mailError);
      return res.status(503).json({
        success: false,
        code: 'EMAIL_VERIFICATION_EMAIL_FAILED',
        message: 'Account created, but the verification email could not be sent. Please request a new code.',
        email: newUser.email,
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email or username is already registered.',
      });
    }
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const sendLoginChallenge = (res, challenge, message = "A sign-in code was sent to your email.") =>
  res.status(200).json({
    success: true,
    requiresOtp: true,
    challengeId: challenge.challengeId,
    email: challenge.email,
    message,
    otpExpiresAt: challenge.otpExpiresAt,
    resendAvailableAt: challenge.resendAvailableAt,
    challengeExpiresAt: challenge.expiresAt,
  });

// Verify the password first, then issue a short-lived email OTP challenge.
const loginUser = async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';
  const { password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an administrator.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verify your email address before signing in.',
      });
    }

    const now = new Date();
    let challenge = await LoginOtp.findOne({
      userId: user._id,
      consumedAt: null,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    if (challenge && challenge.resendAvailableAt > now) {
      return sendLoginChallenge(
        res,
        { ...challenge.toObject(), email: user.email },
        "A sign-in code was already sent. Check your email to continue.",
      );
    }

    if (!challenge) {
      const recentChallenge = await LoginOtp.findOne({
        userId: user._id,
        createdAt: { $gt: new Date(now.getTime() - LOGIN_OTP_COOLDOWN_MS) },
      }).sort({ createdAt: -1 });
      if (recentChallenge?.resendAvailableAt > now) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another sign-in code.",
          retryAfterSeconds: Math.ceil(
            (recentChallenge.resendAvailableAt.getTime() - now.getTime()) / 1000,
          ),
        });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const challengeId =
      challenge?.challengeId || crypto.randomBytes(32).toString("hex");
    const challengeValues = {
      otpHash: hashLoginOtp(challengeId, otp),
      attempts: 0,
      otpExpiresAt: new Date(now.getTime() + LOGIN_OTP_TTL_MS),
      resendAvailableAt: new Date(now.getTime() + LOGIN_OTP_COOLDOWN_MS),
      expiresAt:
        challenge?.expiresAt ||
        new Date(now.getTime() + LOGIN_OTP_CHALLENGE_TTL_MS),
      consumedAt: null,
    };

    if (challenge) {
      challenge = await LoginOtp.findOneAndUpdate(
        {
          _id: challenge._id,
          consumedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: challengeValues },
        { new: true },
      );
      if (!challenge) {
        return res.status(409).json({
          success: false,
          message: "Your sign-in request changed. Please try signing in again.",
        });
      }
    } else {
      challenge = await LoginOtp.create({
        challengeId,
        userId: user._id,
        ...challengeValues,
      });
    }

    try {
      await sendLoginOtpEmail(user.email, otp);
    } catch (mailError) {
      await LoginOtp.updateOne(
        { challengeId, consumedAt: null },
        {
          $set: {
            consumedAt: new Date(),
            resendAvailableAt: new Date(),
          },
        },
      );
      console.error("Login OTP email error:", mailError);
      return res.status(503).json({
        success: false,
        code: "LOGIN_OTP_EMAIL_FAILED",
        message: "Unable to send the sign-in code. Please try again later.",
      });
    }

    return sendLoginChallenge(
      res,
      { ...challenge.toObject(), email: user.email },
    );
  } catch (error) {
    console.error("Login OTP request error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start sign-in. Please try again later.",
    });
  }
};

const resendLoginOtp = async (req, res) => {
  const challengeId =
    typeof req.body.challengeId === "string" ? req.body.challengeId.trim() : "";
  if (!/^[a-f0-9]{64}$/i.test(challengeId)) {
    return res.status(400).json({
      success: false,
      message: "A valid sign-in request is required.",
    });
  }

  try {
    const now = new Date();
    const challenge = await LoginOtp.findOne({
      challengeId,
      consumedAt: null,
      expiresAt: { $gt: now },
    });
    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "This sign-in request has expired. Enter your password again.",
        code: "LOGIN_CHALLENGE_EXPIRED",
      });
    }

    if (challenge.resendAvailableAt > now) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another sign-in code.",
        retryAfterSeconds: Math.ceil(
          (challenge.resendAvailableAt.getTime() - now.getTime()) / 1000,
        ),
      });
    }

    const user = await User.findById(challenge.userId).select(
      "_id email emailVerified isActive",
    );
    if (!user || user.isActive === false || user.emailVerified === false) {
      await LoginOtp.updateOne(
        { _id: challenge._id, consumedAt: null },
        { $set: { consumedAt: now } },
      );
      return res.status(403).json({
        success: false,
        message: "This account cannot sign in. Contact an administrator.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const updatedChallenge = await LoginOtp.findOneAndUpdate(
      {
        _id: challenge._id,
        consumedAt: null,
        expiresAt: { $gt: now },
        resendAvailableAt: { $lte: now },
      },
      {
        $set: {
          otpHash: hashLoginOtp(challengeId, otp),
          attempts: 0,
          otpExpiresAt: new Date(now.getTime() + LOGIN_OTP_TTL_MS),
          resendAvailableAt: new Date(now.getTime() + LOGIN_OTP_COOLDOWN_MS),
        },
      },
      { new: true },
    );
    if (!updatedChallenge) {
      return res.status(409).json({
        success: false,
        message: "Your sign-in request changed. Please try again.",
      });
    }

    try {
      await sendLoginOtpEmail(user.email, otp);
    } catch (mailError) {
      await LoginOtp.updateOne(
        { _id: updatedChallenge._id, consumedAt: null },
        {
          $set: {
            consumedAt: new Date(),
            resendAvailableAt: new Date(),
          },
        },
      );
      console.error("Login OTP resend email error:", mailError);
      return res.status(503).json({
        success: false,
        code: "LOGIN_OTP_EMAIL_FAILED",
        message: "Unable to send the sign-in code. Please try again later.",
      });
    }

    return sendLoginChallenge(
      res,
      { ...updatedChallenge.toObject(), email: user.email },
      "A new sign-in code was sent to your email.",
    );
  } catch (error) {
    console.error("Login OTP resend error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to resend the sign-in code right now.",
    });
  }
};

const verifyLoginOtp = async (req, res) => {
  const challengeId =
    typeof req.body.challengeId === "string" ? req.body.challengeId.trim() : "";
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  if (!/^[a-f0-9]{64}$/i.test(challengeId) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter the 6-digit sign-in code from your email.",
    });
  }

  try {
    const now = new Date();
    const challenge = await LoginOtp.findOne({
      challengeId,
      consumedAt: null,
      expiresAt: { $gt: now },
      otpExpiresAt: { $gt: now },
      attempts: { $lt: LOGIN_OTP_MAX_ATTEMPTS },
    });

    if (!challenge || challenge.otpHash !== hashLoginOtp(challengeId, otp)) {
      const attempt = await LoginOtp.findOneAndUpdate(
        {
          challengeId,
          consumedAt: null,
          expiresAt: { $gt: now },
          otpExpiresAt: { $gt: now },
          attempts: { $lt: LOGIN_OTP_MAX_ATTEMPTS },
        },
        { $inc: { attempts: 1 } },
        { new: true },
      );
      if (attempt?.attempts >= LOGIN_OTP_MAX_ATTEMPTS) {
        await LoginOtp.updateOne(
          { _id: attempt._id, consumedAt: null },
          { $set: { consumedAt: now } },
        );
      }
      return res.status(400).json({
        success: false,
        message: "The sign-in code is invalid or expired. Request a new code and try again.",
      });
    }

    const user = await User.findById(challenge.userId).select(
      "_id username email role isActive emailVerified",
    );
    if (!user || user.isActive === false) {
      await LoginOtp.updateOne(
        { _id: challenge._id, consumedAt: null },
        { $set: { consumedAt: now } },
      );
      return res.status(403).json({
        success: false,
        message: "Your account is unavailable. Contact an administrator.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }
    if (user.emailVerified === false) {
      await LoginOtp.updateOne(
        { _id: challenge._id, consumedAt: null },
        { $set: { consumedAt: now } },
      );
      return res.status(403).json({
        success: false,
        message: "Verify your email address before signing in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const consumedChallenge = await LoginOtp.findOneAndUpdate(
      {
        _id: challenge._id,
        otpHash: hashLoginOtp(challengeId, otp),
        consumedAt: null,
        expiresAt: { $gt: now },
        otpExpiresAt: { $gt: now },
        attempts: { $lt: LOGIN_OTP_MAX_ATTEMPTS },
      },
      { $set: { consumedAt: now } },
      { new: true },
    );
    if (!consumedChallenge) {
      return res.status(400).json({
        success: false,
        message: "This sign-in code has already been used or expired.",
      });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const sessionDetails = getLoginDevice(req.get("user-agent") || "");
    await UserSession.create({
      sessionId,
      userId: user._id,
      ...sessionDetails,
      lastSeenAt: now,
      expiresAt: sessionExpiresAt,
      purgeAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    });

    const token = jwt.sign(
      { userId: user._id, sid: sessionId },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" },
    );
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "admin",
        isActive: user.isActive !== false,
      },
    });
  } catch (error) {
    console.error("Login OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify the sign-in code right now.",
    });
  }
};

const resendEmailVerification = async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid email address.',
    });
  }

  try {
    const user = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
      emailVerified: { $ne: true },
      isActive: { $ne: false },
    });
    const genericMessage =
      'If this email has an active unverified account, a verification code has been sent.';

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const now = Date.now();
    const requestedAt = user.emailVerificationRequestedAt?.getTime();
    if (requestedAt && now - requestedAt < EMAIL_VERIFICATION_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification code.',
        retryAfterSeconds: Math.ceil(
          (EMAIL_VERIFICATION_COOLDOWN_MS - (now - requestedAt)) / 1000,
        ),
      });
    }

    const verification = await issueEmailVerificationOtp(user);
    if (!verification) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification code.',
        retryAfterSeconds: 1,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent if this account is still unverified.',
      expiresAt: verification.expiresAt,
      resendAvailableAt: verification.resendAvailableAt,
    });
  } catch (error) {
    console.error('Email verification resend error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send a verification email right now. Please try again later.',
    });
  }
};

const verifyEmail = async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';
  const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';

  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid email address and 6-digit verification code.',
    });
  }

  try {
    const emailQuery = {
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
      emailVerified: { $ne: true },
      isActive: { $ne: false },
    };
    const now = new Date();
    const user = await User.findOne({
      ...emailQuery,
      emailVerificationOtpHash: hashEmailVerificationOtp(otp),
      emailVerificationOtpExpires: { $gt: now },
      emailVerificationOtpAttempts: { $lt: EMAIL_VERIFICATION_MAX_OTP_ATTEMPTS },
    });

    if (!user) {
      await User.updateOne(
        {
          ...emailQuery,
          emailVerificationOtpHash: { $exists: true, $ne: null },
          emailVerificationOtpExpires: { $gt: now },
          emailVerificationOtpAttempts: { $lt: EMAIL_VERIFICATION_MAX_OTP_ATTEMPTS },
        },
        { $inc: { emailVerificationOtpAttempts: 1 } },
      );
      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired. Request a new code and try again.',
      });
    }

    const verifiedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        emailVerificationOtpHash: hashEmailVerificationOtp(otp),
        emailVerificationOtpExpires: { $gt: now },
        emailVerificationOtpAttempts: { $lt: EMAIL_VERIFICATION_MAX_OTP_ATTEMPTS },
        emailVerified: { $ne: true },
      },
      {
        $set: { emailVerified: true, emailVerificationOtpAttempts: 0 },
        $unset: {
          emailVerificationOtpHash: 1,
          emailVerificationOtpExpires: 1,
          emailVerificationRequestedAt: 1,
        },
      },
      { new: true },
    );

    if (!verifiedUser) {
      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired. Request a new code and try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify your email right now. Please try again later.',
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
  resendLoginOtp,
  verifyLoginOtp,
  resendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
};
