const { FastifyError } = require('fastify');
const CartService = require('../services/cart.service');
const logger = require('../config/logger.config');

class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  getCart(request, reply) {
    const { user } = request;
    
    this.cartService.getCart(user._id)
      .then(cart => {
        reply.send({
          success: true,
          data: cart
        });
      })
      .catch(error => {
        logger.error('Error fetching cart:', error);
        throw new FastifyError(error.message);
      });
  }

  addToCart(request, reply) {
    const { user } = request;
    const { restaurantId, itemId, quantity } = request.body;

    this.cartService.addToCart(user._id, restaurantId, itemId, quantity)
      .then(cart => {
        reply.send({
          success: true,
          data: cart
        });
      })
      .catch(error => {
        logger.error('Error adding to cart:', error);
        throw new FastifyError(error.message);
      });
  }

  updateCartItem(request, reply) {
    const { user } = request;
    const { itemId } = request.params;
    const { quantity } = request.body;

    this.cartService.updateCartItem(user._id, itemId, quantity)
      .then(cart => {
        if (!cart) {
          return reply.status(404).send({
            success: false,
            message: 'Cart or item not found'
          });
        }

        reply.send({
          success: true,
          data: cart
        });
      })
      .catch(error => {
        logger.error('Error updating cart item:', error);
        throw new FastifyError(error.message);
      });
  }

  removeFromCart(request, reply) {
    const { user } = request;
    const { itemId } = request.params;

    this.cartService.removeFromCart(user._id, itemId)
      .then(cart => {
        if (!cart) {
          return reply.status(404).send({
            success: false,
            message: 'Cart or item not found'
          });
        }

        reply.send({
          success: true,
          data: cart
        });
      })
      .catch(error => {
        logger.error('Error removing item from cart:', error);
        throw new FastifyError(error.message);
      });
  }

  clearCart(request, reply) {
    const { user } = request;

    this.cartService.clearCart(user._id)
      .then(() => {
        reply.send({
          success: true,
          message: 'Cart cleared successfully'
        });
      })
      .catch(error => {
        logger.error('Error clearing cart:', error);
        throw new FastifyError(error.message);
      });
  }
}

module.exports = new CartController();