const RestaurantService = require('../services/restaurant.service');
const logger = require('../config/logger.config');

class RestaurantController {
  async getAllRestaurants(req, res) {
    try {
      const result = await RestaurantService.getAllRestaurants(req.query);
      
      res.status(200).json({
        success: true,
        data: result.restaurants,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in getAllRestaurants controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getRestaurantById(req, res) {
    try {
      const restaurant = await RestaurantService.getRestaurantById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error in getRestaurantById controller:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async createRestaurant(req, res) {
    try {
      const restaurant = await RestaurantService.createRestaurant(
        req.body,
        req.user.id
      );
      
      res.status(201).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error in createRestaurant controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateRestaurant(req, res) {
    try {
      const restaurant = await RestaurantService.updateRestaurant(
        req.params.id,
        req.body,
        req.user.id
      );
      
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error in updateRestaurant controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteRestaurant(req, res) {
    try {
      await RestaurantService.deleteRestaurant(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteRestaurant controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateMenu(req, res) {
    try {
      const restaurant = await RestaurantService.updateMenu(
        req.params.id,
        req.body.menu,
        req.user.id
      );
      
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error in updateMenu controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async toggleRestaurantStatus(req, res) {
    try {
      const restaurant = await RestaurantService.toggleRestaurantStatus(
        req.params.id,
        req.user.id
      );
      
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error in toggleRestaurantStatus controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new RestaurantController();
