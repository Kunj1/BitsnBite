const Review = require('../models/Review');
const logger = require('../config/logger.config');

class ReviewService {
  async getAllReviews(query = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', restaurantId } = query;
      
      // Build filter object
      const filter = {};
      if (restaurantId) filter.restaurant = restaurantId;

      // Calculate pagination and sorting
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const reviews = await Review.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('restaurant')
        .lean();

      const total = await Review.countDocuments(filter);

      return {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getAllReviews service:', error);
      throw error;
    }
  }

  async getReviewById(id) {
    try {
      const review = await Review.findById(id)
        .populate('restaurant')
        .lean();

      if (!review) {
        throw new Error('Review not found');
      }

      return review;
    } catch (error) {
      logger.error('Error in getReviewById service:', error);
      throw error;
    }
  }

  async createReview(reviewData, userId) {
    try {
      const review = new Review({
        ...reviewData,
        user: userId
      });

      await review.save();

      return review;
    } catch (error) {
      logger.error('Error in createReview service:', error);
      throw error;
    }
  }

  async updateReview(id, updateData, userId) {
    try {
      const review = await Review.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!review) {
        throw new Error('Review not found or unauthorized');
      }

      return review;
    } catch (error) {
      logger.error('Error in updateReview service:', error);
      throw error;
    }
  }

  async deleteReview(id, userId) {
    try {
      const review = await Review.findOneAndDelete({ _id: id, user: userId });

      if (!review) {
        throw new Error('Review not found or unauthorized');
      }

      return review;
    } catch (error) {
      logger.error('Error in deleteReview service:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();
