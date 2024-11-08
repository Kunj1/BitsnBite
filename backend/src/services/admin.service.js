const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const logger = require('../config/logger.config');
const NotificationService = require('../notifications/notification.service');

class AdminService {
  // User Management
  async getAllUsers() {
    try {
      return await User.find().select('-password');
    } catch (error) {
      logger.error('Error in admin getAllUsers service:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('orders')
        .populate('payments')
        .populate('reviews');
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      logger.error(`Error in admin getUserById service for userId ${userId}:`, error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      if (updateData.role && updateData.role !== user.role) {
        // Use generic sendEmail for role update notification
        await NotificationService.sendEmail(
          user.email,
          'Account Role Update',
          `Your account role has been updated to ${updateData.role}.`,
          `<h1>Account Role Update</h1>
           <p>Your account role has been updated to <strong>${updateData.role}</strong>.</p>
           <p>If you have any questions, please contact support.</p>`
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      return updatedUser;
    } catch (error) {
      logger.error(`Error in admin updateUser service for userId ${userId}:`, error);
      throw error;
    }
  }

  // Restaurant Management
  async getAllRestaurants() {
    try {
      return await Restaurant.find();
    } catch (error) {
      logger.error('Error in admin getAllRestaurants service:', error);
      throw error;
    }
  }

  async createRestaurant(restaurantData) {
    try {
      const restaurant = new Restaurant(restaurantData);
      const savedRestaurant = await restaurant.save();

      // Notify restaurant owner using generic sendEmail
      if (restaurantData.ownerEmail) {
        await NotificationService.sendEmail(
          restaurantData.ownerEmail,
          'Restaurant Registration Successful',
          `Your restaurant "${restaurantData.name}" has been successfully registered on our platform.`,
          `<h1>Restaurant Registration Successful</h1>
           <p>Your restaurant "${restaurantData.name}" has been successfully registered on our platform.</p>
           <p>You can now start managing your restaurant through the dashboard.</p>
           <p>If you need any assistance, please don't hesitate to contact our support team.</p>`
        );
      }

      return savedRestaurant;
    } catch (error) {
      logger.error('Error in admin createRestaurant service:', error);
      throw error;
    }
  }

  async updateRestaurant(restaurantId, updateData) {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $set: updateData },
        { new: true }
      );
      if (!restaurant) throw new Error('Restaurant not found');
      return restaurant;
    } catch (error) {
      logger.error(`Error in admin updateRestaurant service for id ${restaurantId}:`, error);
      throw error;
    }
  }

  async deleteRestaurant(restaurantId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');

      // Notify restaurant owner about deletion using generic sendEmail
      const owner = await User.findById(restaurant.owner);
      if (owner) {
        await NotificationService.sendEmail(
          owner.email,
          'Restaurant Removal Notification',
          `Your restaurant "${restaurant.name}" has been removed from our platform.`,
          `<h1>Restaurant Removal Notification</h1>
           <p>Your restaurant "${restaurant.name}" has been removed from our platform.</p>
           <p>If you believe this is an error, please contact support immediately.</p>`
        );
      }

      await Restaurant.findByIdAndDelete(restaurantId);
      return { message: 'Restaurant deleted successfully' };
    } catch (error) {
      logger.error(`Error in admin deleteRestaurant service for id ${restaurantId}:`, error);
      throw error;
    }
  }

  // Order Management
  async getAllOrders() {
    try {
      return await Order.find()
        .populate('user', '-password')
        .populate('restaurant');
    } catch (error) {
      logger.error('Error in admin getAllOrders service:', error);
      throw error;
    }
  }

  // Payment Management
  async getAllPayments() {
    try {
      return await Payment.find()
        .populate('user', '-password')
        .populate('order');
    } catch (error) {
      logger.error('Error in admin getAllPayments service:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('user', '-password')
        .populate('order');
      if (!payment) throw new Error('Payment not found');
      return payment;
    } catch (error) {
      logger.error(`Error in admin getPaymentById service for id ${paymentId}:`, error);
      throw error;
    }
  }

  // Review Management
  async getAllReviews() {
    try {
      return await Review.find()
        .populate('user', '-password')
        .populate('restaurant');
    } catch (error) {
      logger.error('Error in admin getAllReviews service:', error);
      throw error;
    }
  }

  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('user', '-password')
        .populate('restaurant');
      if (!review) throw new Error('Review not found');
      return review;
    } catch (error) {
      logger.error(`Error in admin getReviewById service for id ${reviewId}:`, error);
      throw error;
    }
  }
}

module.exports = new AdminService();
