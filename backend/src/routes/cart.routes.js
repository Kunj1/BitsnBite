const cartController = require('../controllers/carts.controller');
const { authenticate } = require('../middleware/auth.middleware');

function cartRoutes(fastify, options) {
  // Get user's cart
  fastify.get('/', {
    onRequest: [authenticate],
    handler: cartController.getCart
  });

  // Add item to cart
  fastify.post('/', {
    onRequest: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['restaurantId', 'itemId', 'quantity'],
        properties: {
          restaurantId: { type: 'string' },
          itemId: { type: 'string' },
          quantity: { type: 'number', minimum: 1 }
        }
      }
    },
    handler: cartController.addToCart
  });

  // Update cart item quantity
  fastify.put('/items/:itemId', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['itemId'],
        properties: {
          itemId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number', minimum: 0 }
        }
      }
    },
    handler: cartController.updateCartItem
  });

  // Remove item from cart
  fastify.delete('/items/:itemId', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['itemId'],
        properties: {
          itemId: { type: 'string' }
        }
      }
    },
    handler: cartController.removeFromCart
  });

  // Clear entire cart
  fastify.delete('/', {
    onRequest: [authenticate],
    handler: cartController.clearCart
  });
}

module.exports = cartRoutes;