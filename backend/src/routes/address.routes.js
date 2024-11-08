const addressController = require('../controllers/addresses.controller');
const { authenticate } = require('../middleware/auth.middleware');

const addressSchema = {
  type: 'object',
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    country: { type: 'string' },
    zipCode: { type: 'string' }
  },
  required: ['street', 'city', 'state', 'country', 'zipCode']
};

const addressRoutes = async (fastify) => {
  // Create new address
  fastify.post('/', {
    schema: {
      body: addressSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticate,
    handler: addressController.create
  });

  // Get all addresses
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { 
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    },
    preHandler: authenticate,
    handler: addressController.getAll
  });

  // Get address by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticate,
    handler: addressController.getById
  });

  // Update address
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: addressSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticate,
    handler: addressController.update
  });

  // Delete address
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        204: {
          type: 'null'
        }
      }
    },
    preHandler: authenticate,
    handler: addressController.delete
  });
};

module.exports = addressRoutes;