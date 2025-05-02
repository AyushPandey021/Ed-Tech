const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
exports.auth = async (req, res, next) => {

  try {
    
    // Extract token from cookies, body, or headers
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("authorization")?.replace("Bearer ", "");

    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decode);
       req.user = decode;
       console.log("User from token:", req.user);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    next(); // Continue to next middleware
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// ============================================
// STUDENT CHECK
// ============================================
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// ============================================
// INSTRUCTOR CHECK
// ============================================
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructors only",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// ============================================
// ADMIN CHECK
// ============================================
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admins only",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
