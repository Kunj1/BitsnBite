const Restaurant = require('../models/Restaurant');
const logger = require('../config/logger.config');
const notificationService = require('../notifications/notification.service');

class RestaurantService {
  async getAllRestaurants(query = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'rating', 
        sortOrder = 'desc',
        cuisine,
        minRating,
        searchQuery,
        isOpen
      } = query;

      // Build filter object
      const filter = {};
      
      if (cuisine) {
        filter.cuisineTypes = cuisine;
      }
      
      if (minRating) {
        filter.rating = { $gte: parseFloat(minRating) };
      }

      if (isOpen !== undefined) {
        filter.isOpen = isOpen === 'true';
      }

      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Calculate skip value for pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const restaurants = await Restaurant.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('menu')
        .lean();

      const total = await Restaurant.countDocuments(filter);

      return {
        restaurants,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getAllRestaurants service:', error);
      throw error;
    }
  }

  async getRestaurantById(id) {
    try {
      const restaurant = await Restaurant.findById(id)
        .populate('menu')
        .populate('reviews')
        .lean();

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      return restaurant;
    } catch (error) {
      logger.error('Error in getRestaurantById service:', error);
      throw error;
    }
  }

  async createRestaurant(restaurantData, ownerId) {
    try {
      const restaurant = new Restaurant({
        ...restaurantData,
        owner: ownerId
      });

      await restaurant.save();
      return restaurant;
    } catch (error) {
      logger.error('Error in createRestaurant service:', error);
      throw error;
    }
  }

  async updateRestaurant(id, updateData, ownerId) {
    try {
      const restaurant = await Restaurant.findOneAndUpdate(
        { _id: id, owner: ownerId },
        { 
          ...updateData,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      ).populate('owner');

      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      // Send notification to restaurant owner about the update
      await notificationService.sendOrderStatusUpdate(
        restaurant,
        restaurant.owner,
        `Restaurant details updated - ${Object.keys(updateData).join(', ')}`
      );

      return restaurant;
    } catch (error) {
      logger.error('Error in updateRestaurant service:', error);
      throw error;
    }
  }

  async deleteRestaurant(id, ownerId) {
    try {
      const restaurant = await Restaurant.findOneAndDelete({ 
        _id: id, 
        owner: ownerId 
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      return restaurant;
    } catch (error) {
      logger.error('Error in deleteRestaurant service:', error);
      throw error;
    }
  }

  async updateMenu(id, menuItems, ownerId) {
    try {
      const restaurant = await Restaurant.findOneAndUpdate(
        { _id: id, owner: ownerId },
        { 
          $set: { menu: menuItems },
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      return restaurant;
    } catch (error) {
      logger.error('Error in updateMenu service:', error);
      throw error;
    }
  }

  async toggleRestaurantStatus(id, ownerId) {
    try {
      const restaurant = await Restaurant.findOne({ _id: id, owner: ownerId }).populate('owner');
      
      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      restaurant.isOpen = !restaurant.isOpen;
      restaurant.updatedAt = Date.now();
      
      await restaurant.save();
      
      // Send notification about status change
      await notificationService.sendOrderStatusUpdate(
        restaurant,
        restaurant.owner,
        `Restaurant is now ${restaurant.isOpen ? 'OPEN' : 'CLOSED'}`
      );

      return restaurant;
    } catch (error) {
      logger.error('Error in toggleRestaurantStatus service:', error);
      throw error;
    }
  }
}

module.exports = new RestaurantService();
