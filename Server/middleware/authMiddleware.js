const jwt = require("jsonwebtoken");
const User = require("../module/authmodule/authmodule");
const UserSession = require("../module/authmodule/userSession");

const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required.",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecretkey",
    );
    if (!payload.userId || !payload.sid) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid. Please sign in again.",
      });
    }

    const user = await User.findById(payload.userId).select(
      "_id username email role avatarUrl isActive createdAt",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid. Please sign in again.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact an administrator.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    const session = await UserSession.findOne({
      sessionId: payload.sid,
      userId: user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).select("_id lastSeenAt");
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "This login session has ended. Please sign in again.",
        code: "SESSION_REVOKED",
      });
    }

    if (Date.now() - session.lastSeenAt.getTime() >= 60 * 1000) {
      await UserSession.updateOne(
        {
          _id: session._id,
          revokedAt: null,
          lastSeenAt: session.lastSeenAt,
        },
        { $set: { lastSeenAt: new Date() } },
      );
    }

    req.user = user;
    req.sessionId = payload.sid;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }
    return next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  return next();
};

module.exports = requireAuth;
module.exports.requireAdmin = requireAdmin;
