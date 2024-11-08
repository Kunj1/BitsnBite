const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger.config');
const Restaurant = require('../models/Restaurant');

class AuthMiddleware {
  async authenticate(request, reply) {
    try {
      // Get token from header
      const token = request.headers.authorization?.split(' ')[1];

      if (!token) {
        reply.code(401).send({
          success: false,
          error: 'No token provided, authorization denied'
        });
        return;
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database (excluding password)
        const user = await User.findById(decoded.id)
          .select('-password')
          .lean();

        if (!user) {
          reply.code(401).send({
            success: false,
            error: 'User not found'
          });
          return;
        }

        // Add user to request object
        request.user = user;
      } catch (err) {
        logger.error('Token verification failed:', err);
        reply.code(401).send({
          success: false,
          error: 'Token is invalid'
        });
        return;
      }
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      reply.code(500).send({
        success: false,
        error: 'Server error'
      });
    }
  }

  authorize(roles = []) {
    return async (request, reply) => {
      try {
        if (!request.user) {
          reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
          return;
        }

        // Convert single role to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (allowedRoles.length > 0 && !allowedRoles.includes(request.user.role)) {
          reply.code(403).send({
            success: false,
            error: 'You do not have permission to perform this action'
          });
          return;
        }
        return true;
      } catch (error) {
        logger.error('Authorization middleware error:', error);
        reply.code(500).send({
          success: false,
          error: 'Server error'
        });
      }
    };
  }

  // Optional: Middleware to check if user is restaurant owner
  async isRestaurantOwner(request, reply) {
    try {
      const restaurantId = request.params.id;
      const userId = request.user.id;

      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
        reply.code(404).send({
          success: false,
          error: 'Restaurant not found'
        });
        return;
      }

      if (restaurant.owner.toString() !== userId) {
        reply.code(403).send({
          success: false,
          error: 'You are not authorized to perform this action'
        });
        return;
      }
      return true;
    } catch (error) {
      logger.error('Restaurant owner check middleware error:', error);
      reply.code(500).send({
        success: false,
        error: 'Server error'
      });
    }
  }

  // Optional: Middleware to check if user is admin
  async isAdmin(request, reply) {
    try {
      if (request.user.role !== 'admin') {
        reply.code(403).send({
          success: false,
          error: 'Admin access required'
        });
        return;
      }
      return true;
    } catch (error) {
      logger.error('Admin check middleware error:', error);
      reply.code(500).send({
        success: false,
        error: 'Server error'
      });
    }
  }

  // Optional: Middleware to refresh token
  async refreshToken(request, reply) {
    try {
      const { refreshToken } = request.body;

      if (!refreshToken) {
        reply.code(401).send({
          success: false,
          error: 'Refresh token required'
        });
        return;
      }

      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          reply.code(401).send({
            success: false,
            error: 'User not found'
          });
          return;
        }

        // Generate new access token
        const accessToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        reply.send({
          success: true,
          data: { accessToken }
        });
      } catch (err) {
        logger.error('Refresh token verification failed:', err);
        reply.code(401).send({
          success: false,
          error: 'Invalid refresh token'
        });
      }
    } catch (error) {
      logger.error('Refresh token middleware error:', error);
      reply.code(500).send({
        success: false,
        error: 'Server error'
      });
    }
  }
}

module.exports = new AuthMiddleware();