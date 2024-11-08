const AuthController = require('../controllers/auth.controller');

const registerSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      name: { type: 'string' },
      phoneNumber: { type: 'string' },
      role: { type: 'string' }
    },
    required: ['email', 'password', 'name', 'phoneNumber', 'role']
  }
};

async function routes(fastify, options) {
  // Register route
  fastify.post('/register', { schema: registerSchema }, AuthController.register);

  // Login route
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    },
    handler: AuthController.login
  });

  // Logout route
  fastify.post('/logout', {
    handler: AuthController.logout
  });

  // Password reset request route
  fastify.post('/password-reset', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    },
    handler: AuthController.requestPasswordReset
  });
}

module.exports = routes;