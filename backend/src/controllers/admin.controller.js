const AdminService = require('../services/admin.service.js');
const logger = require('../config/logger.config.js');

class AdminController {
  async getAllOrders(request, reply) {
    try {
      const orders = await AdminService.getAllOrders();
      return reply.code(200).send({ success: true, data: orders });
    } catch (error) {
      logger.error('Error in getAllOrders controller:', error);
      throw error;
    }
  }

  async getAllRestaurants(request, reply) {
    try {
      const restaurants = await AdminService.getAllRestaurants();
      return reply.code(200).send({ success: true, data: restaurants });
    } catch (error) {
      logger.error('Error in getAllRestaurants controller:', error);
      throw error;
    }
  }

  async createRestaurant(request, reply) {
    try {
      const restaurantData = request.body;
      const restaurant = await AdminService.createRestaurant(restaurantData);
      return reply.code(201).send({ success: true, data: restaurant });
    } catch (error) {
      logger.error('Error in createRestaurant controller:', error);
      throw error;
    }
  }

  async updateRestaurant(request, reply) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const restaurant = await AdminService.updateRestaurant(id, updateData);
      return reply.code(200).send({ success: true, data: restaurant });
    } catch (error) {
      logger.error('Error in updateRestaurant controller:', error);
      throw error;
    }
  }

  async deleteRestaurant(request, reply) {
    try {
      const { id } = request.params;
      await AdminService.deleteRestaurant(id);
      return reply.code(200).send({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
      logger.error('Error in deleteRestaurant controller:', error);
      throw error;
    }
  }

  async getAllUsers(request, reply) {
    try {
      const users = await AdminService.getAllUsers();
      return reply.code(200).send({ success: true, data: users });
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error);
      throw error;
    }
  }

  async getUserById(request, reply) {
    try {
      const { id } = request.params;
      const user = await AdminService.getUserById(id);
      return reply.code(200).send({ success: true, data: user });
    } catch (error) {
      logger.error('Error in getUserById controller:', error);
      throw error;
    }
  }

  async updateUser(request, reply) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const user = await AdminService.updateUser(id, updateData);
      return reply.code(200).send({ success: true, data: user });
    } catch (error) {
      logger.error('Error in updateUser controller:', error);
      throw error;
    }
  }

  async getAllPayments(request, reply) {
    try {
      const payments = await AdminService.getAllPayments();
      return reply.code(200).send({ success: true, data: payments });
    } catch (error) {
      logger.error('Error in getAllPayments controller:', error);
      throw error;
    }
  }

  async getPaymentById(request, reply) {
    try {
      const { id } = request.params;
      const payment = await AdminService.getPaymentById(id);
      return reply.code(200).send({ success: true, data: payment });
    } catch (error) {
      logger.error('Error in getPaymentById controller:', error);
      throw error;
    }
  }

  async getAllReviews(request, reply) {
    try {
      const reviews = await AdminService.getAllReviews();
      return reply.code(200).send({ success: true, data: reviews });
    } catch (error) {
      logger.error('Error in getAllReviews controller:', error);
      throw error;
    }
  }

  async getReviewById(request, reply) {
    try {
      const { id } = request.params;
      const review = await AdminService.getReviewById(id);
      return reply.code(200).send({ success: true, data: review });
    } catch (error) {
      logger.error('Error in getReviewById controller:', error);
      throw error;
    }
  }
}

module.exports= new AdminController();