const User=require('../models/User');
const mailSender= require('../utils/MailSender');
const bcrypt=require('bcrypt')
const crypto = require('crypto');


//resetpasswordtoken
exports.resetPasswordToken = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // Even if email doesn't exist, send same response
        return res.status(200).json({
          success: true,
          message: 'If your email is registered, a reset link has been sent.',
        });
      }
  
      // Generate token and set expiry (5 min)
      const token = crypto.randomUUID();
      const resetTokenExpiry = Date.now() + 5 * 60 * 1000;
  
      // Update user with token and expiry
      await User.findOneAndUpdate(
        { email },
        {
          token,
          resetPasswordExpires: resetTokenExpiry,
        },
        { new: true }
      );
  
      // Send email with reset URL
      const url = `https://localhost:3000/update-password/${token}`;
      await mailSender(email, 'Password Reset Link', `Click to reset: ${url}`);
  
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, a reset link has been sent.',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong while sending reset email.',
      });
    }
  };
  

//resetPassword
exports.resetPassword = async (req, res) => {
    try {
      const { password, confirmPassword, token } = req.body;
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match.',
        });
      }
  
      // Find user with token
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token.',
        });
      }
  
      // Check if token has expired
      if (user.resetPasswordExpires < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Token has expired. Please request a new reset link.',
        });
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update password, remove token and expiry
      await User.findOneAndUpdate(
        { token },
        {
          password: hashedPassword,
          token: null,
          resetPasswordExpires: null,
        },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong while resetting the password.',
      });
    }
  };
  