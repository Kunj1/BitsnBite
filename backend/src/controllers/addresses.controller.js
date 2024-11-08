const { createAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress } = require('../services/address.service');
const logger = require('../config/logger.config');

const addressController = {
  // Create new address
  create: async (request, reply) => {
    try {
      logger.info('Creating new address');
      const userId = request.user._id; // From auth middleware
      const address = await createAddress(userId, request.body);
      
      return reply.code(201).send({
        success: true,
        data: address
      });
    } catch (error) {
      logger.error('Error creating address:', error);
      throw error;
    }
  },

  // Get all addresses for a user
  getAll: async (request, reply) => {
    try {
      logger.info('Fetching all addresses for user');
      const userId = request.user._id;
      const addresses = await getAllAddresses(userId);
      
      return reply.send({
        success: true,
        data: addresses
      });
    } catch (error) {
      logger.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Get specific address
  getById: async (request, reply) => {
    try {
      logger.info(`Fetching address with id: ${request.params.id}`);
      const address = await getAddressById(request.params.id, request.user._id);
      
      return reply.send({
        success: true,
        data: address
      });
    } catch (error) {
      logger.error('Error fetching address:', error);
      throw error;
    }
  },

  // Update address
  update: async (request, reply) => {
    try {
      logger.info(`Updating address with id: ${request.params.id}`);
      const updatedAddress = await updateAddress(
        request.params.id,
        request.user._id,
        request.body
      );
      
      return reply.send({
        success: true,
        data: updatedAddress
      });
    } catch (error) {
      logger.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  delete: async (request, reply) => {
    try {
      logger.info(`Deleting address with id: ${request.params.id}`);
      await deleteAddress(request.params.id, request.user._id);
      
      return reply.code(204).send();
    } catch (error) {
      logger.error('Error deleting address:', error);
      throw error;
    }
  }
};

module.exports = addressController;