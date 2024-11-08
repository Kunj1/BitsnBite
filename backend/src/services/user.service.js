const User = require('../models/User');
const bcrypt = require('bcrypt');
const logger = require('../config/logger.config');
const NotificationService = require('../notifications/notification.service');

class UserService {
  async getAllUsers() {
    try {
      return await User.find({ role: 'user' })
        .select('-password')
        .populate('addresses')
        .populate('orders')
        .populate('reviews');
    } catch (error) {
      logger.error('Error in getAllUsers service:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('addresses')
        .populate('orders')
        .populate('reviews');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Error in getUserById service for userId ${userId}:`, error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId).select('-password');
    
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw new error;
      }
      // If password is being updated, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
        
        // Send password change notification
        await NotificationService.sendEmail(
          updateData.email,
          'Password Update Notification',
          'Your password has been successfully updated. If you did not make this change, please contact support immediately.'
        );
      }
      
      if (updateData.email && updateData.email !== user.email) {
        // Send email change notification to both old and new email
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) {
          throw new Error('The email address is already in use.');
        }

        await NotificationService.sendEmail(
          user.email,
          'Email Change Notification',
          'Your email address is being updated. If you did not make this change, please contact support immediately.'
        )
        
        await NotificationService.sendEmail(
          updateData.email,
          'Email Verification',
          'Your email has been successfully linked to your account.'
        );
      }
      
      updateData.updatedAt = Date.now();
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    } catch (error) {
      logger.error(`Error in updateUser service for userId ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new UserService();