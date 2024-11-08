const ReviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

async function routes(fastify, options) {
  // Get all reviews (public)
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
          sortBy: { type: 'string', enum: ['rating', 'createdAt'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          restaurantId: { type: 'string' }
        }
      }
    },
    handler: ReviewController.getAllReviews
  });

  // Get review by ID (public)
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: ReviewController.getReviewById
  });

  // Create review (authenticated users only)
  fastify.post('/', {
    preHandler: [authenticate, authorize(['user', 'admin'])],
    schema: {
      body: {
        type: 'object',
        required: ['rating', 'comment', 'restaurantId'],
        properties: {
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          restaurantId: { type: 'string' }
        }
      }
    },
    handler: ReviewController.createReview
  });

  // Update review (authenticated review owner only)
  fastify.put('/:id', {
    preHandler: [authenticate, authorize(['user', 'admin'])],
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
        properties: {
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' }
        }
      }
    },
    handler: ReviewController.updateReview
  });

  // Delete review (authenticated review owner only)
  fastify.delete('/:id', {
    preHandler: [authenticate, authorize(['user', 'admin'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: ReviewController.deleteReview
  });
}

module.exports = routes;
