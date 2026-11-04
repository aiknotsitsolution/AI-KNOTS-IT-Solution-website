const router = require("express").Router();
const {
  registerUser,
  loginUser,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} = require("../controller/auth/authcontroler");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
