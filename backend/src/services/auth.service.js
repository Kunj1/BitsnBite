const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const notificationService = require('../notifications/notification.service');
const logger = require('../config/logger.config');

class AuthService {

  async register(userData) {
    try {
      const { email, password, name, phoneNumber, role } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        role
      });

      await user.save();

      // Send welcome email using generic sendEmail function
      await notificationService.sendEmail(
        email,
        'Welcome to Our Platform!',
        `Welcome ${name}! Thank you for registering with us.`,
        `
          <h1>Welcome to Our Platform!</h1>
          <p>Dear ${name},</p>
          <p>Thank you for registering with us. We're excited to have you on board!</p>
          <p>You can now start using our services by logging into your account.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>BitsnBite</p>
        `
      );

      // Generate JWT token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      logger.error('Error in register service:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      logger.error('Error in login service:', error);
      throw error;
    }
  }

  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Store OTP in user document (in production, store with expiry)
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send reset password email using generic sendEmail function
      await notificationService.sendEmail(
        email,
        'Password Reset OTP',
        `Your OTP for password reset is: ${otp}. This code will expire in 1 hour.`,
        `
          <h1>Password Reset OTP</h1>
          <p>You have requested to reset your password.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h2 style="font-size: 24px; color: #4CAF50; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
            ${otp}
          </h2>
          <p>This OTP will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email or contact support.</p>
          <p>Best regards,<br>Your Platform Team</p>
        `
      );

      return true;
    } catch (error) {
      logger.error('Error in requestPasswordReset service:', error);
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthService();