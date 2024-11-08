const fastify = require('fastify');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifyCookie = require('@fastify/cookie');
const fastifyHelmet = require('@fastify/helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { errorHandler, asyncHandler } = require('./utils');
//const { NotFoundError } = require('./utils/errors');

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const restaurantRoutes = require('./routes/restaurant.routes.js');
const orderRoutes = require('./routes/order.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const userRoutes = require('./routes/user.routes.js');
const addressRoutes = require('./routes/address.routes.js');
const paymentRoutes = require('./routes/payment.routes.js');
const reviewRoutes = require('./routes/review.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

const logger = require('./config/logger.config.js');

// Load environment variables
dotenv.config();

// Create Fastify instance with custom options for handling raw body (needed for Stripe webhooks)
const app = fastify({
  logger: true,
  trustProxy: true,
  bodyLimit: 50 * 1024 * 1024, // 50MB limit
  // Add raw body support for Stripe webhooks
  onProtoPoisoning: 'remove',
  onConstructorPoisoning: 'remove',
  // Custom body parser to handle raw body for Stripe webhooks
  addContentTypeParser: ['application/json', 'application/x-www-form-urlencoded'],
});

// Initialize server
const startServer = async () => {
  try {
    // Register security plugins
    await app.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          connectSrc: ["'self'", 'https://api.stripe.com']
        }
      }
    });

    // CORS configuration
    await app.register(fastifyCors, {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
    });

    // JWT configuration
    await app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
      sign: {
        expiresIn: '1h'
      },
      cookie: {
        cookieName: 'refreshToken',
        signed: false
      }
    });

    // Cookie configuration
    await app.register(fastifyCookie, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      hook: 'onRequest',
      parseOptions: {}
    });

    // Authentication decorator
    app.decorate('authenticate', async function(request, reply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    // Custom parser for Stripe webhooks
    app.addContentTypeParser('application/json', {}, (req, body, done) => {
      if (req.url === '/payments/webhook' && req.headers['stripe-signature']) {
        // Store raw body for Stripe webhook verification
        req.rawBody = body;
      }
      done(null, body);
    });

    // Register routes with prefixes
    await app.register(authRoutes, { prefix: '/auth' });
    await app.register(restaurantRoutes, { prefix: '/restaurants' });
    await app.register(orderRoutes, { prefix: '/orders' });
    await app.register(cartRoutes, { prefix: '/cart' });
    await app.register(userRoutes, { prefix: '/users' });
    await app.register(addressRoutes, { prefix: '/addresses' });
    await app.register(paymentRoutes, { prefix: '/payments' });
    await app.register(reviewRoutes, { prefix: '/reviews' });
    await app.register(adminRoutes, { prefix: '/admin' });

    // Health check route
    app.get('/health', async (request, reply) => {
      const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoStatus
      };
    });

    // Global error handler
    app.setErrorHandler((error, request, reply) => {
      logger.error('Error occurred:', { 
        error: error.message,
        stack: error.stack,
        path: request.url,
        method: request.method
      });
      errorHandler(error, reply);
    });

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Start server
    const port = process.env.PORT || 5000;
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`Server is running on port ${port}`);

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  // Give time for logging before exit
  setTimeout(() => process.exit(1), 1000);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Give time for logging before exit
  setTimeout(() => process.exit(1), 1000);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Received shutdown signal');
  try {
    await app.close();
    await mongoose.connection.close();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

module.exports = app;