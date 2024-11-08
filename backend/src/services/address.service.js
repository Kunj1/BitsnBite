const Address = require('../models/Address');
const { NotFoundError, UnauthorizedError } = require('../utils/errors');
const logger = require('../config/logger.config');
const notificationService = require('../notifications/notification.service');

const addressService = {
  // Create new address
  createAddress: async (userId, addressData) => {
    try {
      logger.info('Creating new address in service');
      const address = new Address({
        user: userId,
        ...addressData
      });
      
      const savedAddress = await address.save();
      
      // Send email notification for new address
      const user = await User.findById(userId);
      await notificationService.sendEmail(
        user.email,
        'New Delivery Address Added',
        `Your new delivery address has been successfully added to your account.
         Address: ${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}`,
        `<h2>New Delivery Address Added</h2>
         <p>Your new delivery address has been successfully added to your account:</p>
         <p><strong>Street:</strong> ${address.street}</p>
         <p><strong>City:</strong> ${address.city}</p>
         <p><strong>State:</strong> ${address.state}</p>
         <p><strong>Country:</strong> ${address.country}</p>
         <p><strong>Zip Code:</strong> ${address.zipCode}</p>`
      );
      
      return savedAddress;
    } catch (error) {
      logger.error('Error in createAddress service:', error);
      throw error;
    }
  },

  // Get all addresses for a user
  getAllAddresses: async (userId) => {
    try {
      logger.info('Fetching all addresses in service');
      return await Address.find({ user: userId });
    } catch (error) {
      logger.error('Error in getAllAddresses service:', error);
      throw error;
    }
  },

  // Get specific address
  getAddressById: async (addressId, userId) => {
    try {
      logger.info(`Fetching address by id: ${addressId}`);
      const address = await Address.findById(addressId);
      
      if (!address) {
        throw new NotFoundError('Address not found');
      }
      
      if (address.user.toString() !== userId.toString()) {
        throw new UnauthorizedError('Not authorized to access this address');
      }
      
      return address;
    } catch (error) {
      logger.error('Error in getAddressById service:', error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, userId, updateData) => {
    try {
      logger.info(`Updating address: ${addressId}`);
      const address = await Address.findById(addressId);
      
      if (!address) {
        throw new NotFoundError('Address not found');
      }
      
      if (address.user.toString() !== userId.toString()) {
        throw new UnauthorizedError('Not authorized to update this address');
      }
      
      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
      
      // Send email notification for address update
      const user = await User.findById(userId);
      await notificationService.sendEmail(
        user.email,
        'Delivery Address Updated',
        `Your delivery address has been successfully updated.
         New Address: ${updatedAddress.street}, ${updatedAddress.city}, ${updatedAddress.state}, ${updatedAddress.country} - ${updatedAddress.zipCode}`,
        `<h2>Delivery Address Updated</h2>
         <p>Your delivery address has been successfully updated to:</p>
         <p><strong>Street:</strong> ${updatedAddress.street}</p>
         <p><strong>City:</strong> ${updatedAddress.city}</p>
         <p><strong>State:</strong> ${updatedAddress.state}</p>
         <p><strong>Country:</strong> ${updatedAddress.country}</p>
         <p><strong>Zip Code:</strong> ${updatedAddress.zipCode}</p>`
      );
      
      return updatedAddress;
    } catch (error) {
      logger.error('Error in updateAddress service:', error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId, userId) => {
    try {
      logger.info(`Deleting address: ${addressId}`);
      const address = await Address.findById(addressId);
      
      if (!address) {
        throw new NotFoundError('Address not found');
      }
      
      if (address.user.toString() !== userId.toString()) {
        throw new UnauthorizedError('Not authorized to delete this address');
      }
      
      await Address.findByIdAndDelete(addressId);
      
      // Send email notification for address deletion
      const user = await User.findById(userId);
      await notificationService.sendEmail(
        user.email,
        'Delivery Address Removed',
        `Your delivery address has been successfully removed from your account.
         Removed Address: ${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}`,
        `<h2>Delivery Address Removed</h2>
         <p>The following delivery address has been removed from your account:</p>
         <p><strong>Street:</strong> ${address.street}</p>
         <p><strong>City:</strong> ${address.city}</p>
         <p><strong>State:</strong> ${address.state}</p>
         <p><strong>Country:</strong> ${address.country}</p>
         <p><strong>Zip Code:</strong> ${address.zipCode}</p>`
      );
      
      return true;
    } catch (error) {
      logger.error('Error in deleteAddress service:', error);
      throw error;
    }
  }
};

module.exports = addressService;