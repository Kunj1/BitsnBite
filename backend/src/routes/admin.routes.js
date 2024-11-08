const AdminController = require('../controllers/admin.controller.js');
const AuthMiddleware = require('../middleware/auth.middleware.js');

async function adminRoutes(fastify, options) {
  const adminAuth = [AuthMiddleware.authenticate, AuthMiddleware.isAdmin];

  // Orders
  fastify.get('/orders', { preHandler: adminAuth }, AdminController.getAllOrders);

  // Restaurants
  fastify.get('/restaurants', { preHandler: adminAuth }, AdminController.getAllRestaurants);
  fastify.post('/restaurants', { preHandler: adminAuth }, AdminController.createRestaurant);
  fastify.put('/restaurants/:id', { preHandler: adminAuth }, AdminController.updateRestaurant);
  fastify.delete('/restaurants/:id', { preHandler: adminAuth }, AdminController.deleteRestaurant);

  // Users
  fastify.get('/users', { preHandler: adminAuth }, AdminController.getAllUsers);
  fastify.get('/users/:id', { preHandler: adminAuth }, AdminController.getUserById);
  fastify.put('/users/:id', { preHandler: adminAuth }, AdminController.updateUser);

  // Payments
  fastify.get('/payments', { preHandler: adminAuth }, AdminController.getAllPayments);
  fastify.get('/payments/:id', { preHandler: adminAuth }, AdminController.getPaymentById);

  // Reviews
  fastify.get('/reviews', { preHandler: adminAuth }, AdminController.getAllReviews);
  fastify.get('/reviews/:id', { preHandler: adminAuth }, AdminController.getReviewById);
}

module.exports= adminRoutes;