const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

async function orderRoutes(fastify, options) {
  // Create new order
  fastify.post('/', {
    onRequest: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['restaurant', 'items', 'address', 'payment'],
        properties: {
          restaurant: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['item', 'quantity'],
              properties: {
                item: { type: 'string' },
                quantity: { type: 'number', minimum: 1 }
              }
            }
          },
          address: { type: 'string' },
          payment: { type: 'string' }
        }
      }
    },
    handler: orderController.createOrder
  });

  // Get all orders
  fastify.get('/', {
    onRequest: [authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { 
            type: 'string',
            enum: ['placed', 'accepted', 'preparing', 'delivered', 'cancelled']
          },
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 }
        }
      }
    },
    handler: orderController.getOrders
  });

  // Get order by ID
  fastify.get('/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: orderController.getOrderById
  });

  // Update order status
  fastify.put('/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['accepted', 'preparing', 'delivered', 'cancelled']
          }
        }
      }
    },
    handler: orderController.updateOrderStatus
  });

  // Cancel order
  fastify.delete('/:id', {
    onRequest: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 1 }
        }
      }
    },
    handler: orderController.cancelOrder
  });
}

module.exports = orderRoutes;