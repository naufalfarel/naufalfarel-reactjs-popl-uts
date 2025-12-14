const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../Utils/logger");

// ==========================
// Generate JWT Token
// ==========================
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-this",
    { expiresIn: "30d" }
  );
};

// ==========================
// Register User
// ==========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    logger.info({
      action: "REGISTER_ATTEMPT",
      email,
      ip: req.ip,
    });

    if (!name || !email || !password) {
      logger.warn({
        action: "REGISTER_VALIDATION_FAILED",
        email,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn({
        action: "REGISTER_FAILED_EMAIL_EXISTS",
        email,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    logger.info({
      action: "REGISTER_SUCCESS",
      userId: user._id.toString(),
      email: user.email,
      ip: req.ip,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error({
      action: "REGISTER_ERROR",
      email: req.body?.email,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ==========================
// Login User
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info({
      action: "LOGIN_ATTEMPT",
      email,
      ip: req.ip,
    });

    if (!email || !password) {
      logger.warn({
        action: "LOGIN_VALIDATION_FAILED",
        email,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn({
        action: "LOGIN_FAILED_USER_NOT_FOUND",
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      logger.warn({
        action: "LOGIN_FAILED_ACCOUNT_DEACTIVATED",
        userId: user._id.toString(),
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn({
        action: "LOGIN_FAILED_WRONG_PASSWORD",
        userId: user._id.toString(),
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    logger.info({
      action: "LOGIN_SUCCESS",
      userId: user._id.toString(),
      email: user.email,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error({
      action: "LOGIN_ERROR",
      email: req.body?.email,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ==========================
// Get Current User
// ==========================
exports.getCurrentUser = async (req, res) => {
  try {
    logger.info({
      action: "GET_CURRENT_USER",
      userId: req.userId,
      ip: req.ip,
    });

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      logger.warn({
        action: "GET_CURRENT_USER_NOT_FOUND",
        userId: req.userId,
      });

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error({
      action: "GET_CURRENT_USER_ERROR",
      userId: req.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// ==========================
// Update Profile
// ==========================
exports.updateProfile = async (req, res) => {
  try {
    logger.info({
      action: "UPDATE_PROFILE_ATTEMPT",
      userId: req.userId,
      ip: req.ip,
    });

    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    logger.info({
      action: "UPDATE_PROFILE_SUCCESS",
      userId: req.userId,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    logger.error({
      action: "UPDATE_PROFILE_ERROR",
      userId: req.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==========================
// Change Password
// ==========================
exports.changePassword = async (req, res) => {
  try {
    logger.info({
      action: "CHANGE_PASSWORD_ATTEMPT",
      userId: req.userId,
      ip: req.ip,
    });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      logger.warn({
        action: "CHANGE_PASSWORD_VALIDATION_FAILED",
        userId: req.userId,
      });

      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const user = await User.findById(req.userId);

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      logger.warn({
        action: "CHANGE_PASSWORD_FAILED_WRONG_PASSWORD",
        userId: req.userId,
      });

      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    logger.info({
      action: "CHANGE_PASSWORD_SUCCESS",
      userId: req.userId,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error({
      action: "CHANGE_PASSWORD_ERROR",
      userId: req.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
