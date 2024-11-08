const RestaurantController = require('../controllers/restaurant.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

async function routes(fastify, options) {
  // Get all restaurants (public)
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
          sortBy: { type: 'string', enum: ['rating', 'name', 'createdAt'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          cuisine: { type: 'string' },
          minRating: { type: 'number' },
          searchQuery: { type: 'string' },
          isOpen: { type: 'boolean' }
        }
      }
    },
    handler: RestaurantController.getAllRestaurants
  });

  // Get restaurant by ID (public)
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
    handler: RestaurantController.getRestaurantById
  });

  // Create restaurant (authenticated restaurant owners only)
  fastify.post('/', {
    preHandler: [authenticate, authorize(['restaurantOwner', 'admin'])],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'address', 'cuisineTypes'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          address: {
            type: 'object',
            required: ['street', 'city', 'state', 'zipCode'],
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          cuisineTypes: { 
            type: 'array',
            items: { type: 'string' }
          },
          openingHours: {
            type: 'object',
            properties: {
              monday: { type: 'string' },
              tuesday: { type: 'string' },
              wednesday: { type: 'string' },
              thursday: { type: 'string' },
              friday: { type: 'string' },
              saturday: { type: 'string' },
              sunday: { type: 'string' }
            }
          }
        }
      }
    },
    handler: RestaurantController.createRestaurant
  });

/*
  THIS IS FOR THE ADMIN || RESTAURANT OWNER CHECK. FOR FUTURE REFERENCE(CHECK)

  preHandler: [authenticate, async (request, reply) => {
    // First authorize for admin role
    const isAuthorized = await authorize(['admin'])(request, reply);
    if (isAuthorized === true) return true; // If user is admin, allow

    // If not admin, check if the user is a restaurant owner
    return await isRestaurantOwner(request, reply);
}],
 */

  // Update restaurant (authenticated owner only)
  fastify.put('/:id', {
    preHandler: [authenticate, authorize(['restaurantOwner', 'admin'])],
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
          name: { type: 'string' },
          description: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          cuisineTypes: { 
            type: 'array',
            items: { type: 'string' }
          },
          openingHours: {
            type: 'object',
            properties: {
              monday: { type: 'string' },
              tuesday: { type: 'string' },
              wednesday: { type: 'string' },
              thursday: { type: 'string' },
              friday: { type: 'string' },
              saturday: { type: 'string' },
              sunday: { type: 'string' }
            }
          }
        }
      }
    },
    handler: RestaurantController.updateRestaurant
  });

  // Delete restaurant (authenticated owner only)
  fastify.delete('/:id', {
    preHandler: [authenticate, authorize(['restaurantOwner', 'admin'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: RestaurantController.deleteRestaurant
  });

  // Update menu (authenticated owner only)
  fastify.put('/:id/menu', {
    preHandler: [authenticate, authorize(['restaurantOwner', 'admin'])],
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
        required: ['menu'],
        properties: {
          menu: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'price', 'description', 'category'],
              properties: {
                name: { type: 'string' },
                price: { type: 'number' },
                description: { type: 'string' },
                category: { type: 'string' },
                isVegetarian: { type: 'boolean' },
                isVegan: { type: 'boolean' },
                isGlutenFree: { type: 'boolean' },
                spicyLevel: { type: 'number', minimum: 0, maximum: 3 },
                image: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: RestaurantController.updateMenu
  });

  // Toggle restaurant status (open/closed) (authenticated owner only)
  fastify.patch('/:id/toggle-status', {
    preHandler: [authenticate, authorize(['restaurantOwner', 'admin'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: RestaurantController.toggleRestaurantStatus
  });
}

module.exports = routes;