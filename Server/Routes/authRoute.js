const router = require("express").Router();
const {
  registerUser,
  loginUser,
  resendLoginOtp,
  verifyLoginOtp,
  resendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} = require("../controller/auth/authcontroler");
const {
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
} = require("../controller/auth/profileController");
const requireAuth = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getUsers,
  updateUser,
  setUserActive,
  deleteUser,
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
} = require("../controller/auth/userManagementController");

router.post("/register", requireAuth, requireAdmin, registerUser);
router.post("/login", loginUser);
router.post("/login/resend-otp", resendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendEmailVerification);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/session", requireAuth, (req, res) =>
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role || "admin",
      isActive: req.user.isActive !== false,
    },
  }),
);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.put("/users/:id", requireAuth, requireAdmin, updateUser);
router.patch("/users/:id/status", requireAuth, requireAdmin, setUserActive);
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);
router.get("/users/:id/sessions", requireAuth, requireAdmin, getUserSessions);
router.delete(
  "/users/:id/sessions/:sessionId",
  requireAuth,
  requireAdmin,
  revokeUserSession,
);
router.delete(
  "/users/:id/sessions",
  requireAuth,
  requireAdmin,
  revokeAllUserSessions,
);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.post(
  "/profile/email/request-current-otp",
  requireAuth,
  requestCurrentEmailOtp,
);
router.post(
  "/profile/email/verify-current-otp",
  requireAuth,
  verifyCurrentEmailOtp,
);
router.post(
  "/profile/email/request-new-otp",
  requireAuth,
  requestNewEmailOtp,
);
router.post(
  "/profile/email/verify-new-otp",
  requireAuth,
  verifyNewEmailOtp,
);
router.post("/profile/avatar", requireAuth, uploadProfileAvatar);
router.post(
  "/profile/password/request-otp",
  requireAuth,
  requestPasswordChangeOtp,
);
router.post(
  "/profile/password/verify-otp",
  requireAuth,
  verifyPasswordChangeOtp,
);
router.post("/profile/password/change", requireAuth, changePassword);

module.exports = router;
