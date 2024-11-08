const UserController = require('../controllers/users.controller.js');
const AuthMiddleware = require('../middleware/auth.middleware.js');

async function userRoutes(fastify, options) {
  // Get all users (protected)
  fastify.get(
    '/',
    { preHandler: [AuthMiddleware.authenticate] },
    UserController.getUsers
  );

  // Get user by ID (protected)
  fastify.get(
    '/:id',
    { preHandler: [AuthMiddleware.authenticate] },
    UserController.getUserById
  );

  // Update user (protected)
  fastify.put(
    '/:id',
    { preHandler: [AuthMiddleware.authenticate] },
    UserController.updateUser
  );
}

module.exports= userRoutes;