const express = require("express");

const { login, register, logout, meController, updatePassword, forgotPassword, verifyOTP, resetPassword } = require("../../controllers/auth/authController");
const refreshAccessToken = require("../../utils/refreshToken");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();


router.post("/login", login);
router.post("/register", protect, register);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protect, meController);
router.post("/logout", protect, logout);
router.put("/update-password", protect, updatePassword);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);



module.exports = router;