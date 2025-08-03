const express = require("express");
const authController = require("../controllers/authController");
const { multerMiddleware } = require("../config/cloudinaryConfig");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

// Protected route
router.put("/update-profile", authMiddleware, multerMiddleware, authController.updateProfile);
router.get("/logout",authController.logout);
router.get("/check-auth",authMiddleware,authController.checkAuthenticate);
module.exports = router;
