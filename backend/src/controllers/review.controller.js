const ReviewService = require('../services/review.service');
const logger = require('../config/logger.config');

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const result = await ReviewService.getAllReviews(req.query);
      
      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in getAllReviews controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getReviewById(req, res) {
    try {
      const review = await ReviewService.getReviewById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('Error in getReviewById controller:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async createReview(req, res) {
    try {
      const review = await ReviewService.createReview(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('Error in createReview controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateReview(req, res) {
    try {
      const review = await ReviewService.updateReview(req.params.id, req.body, req.user.id);
      
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('Error in updateReview controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteReview(req, res) {
    try {
      await ReviewService.deleteReview(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteReview controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ReviewController();
