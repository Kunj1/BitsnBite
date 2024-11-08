const PaymentController = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth.middleware');

async function paymentRoutes(fastify, options) {
  // Create payment intent
  fastify.post('/create-intent', 
    { 
      preHandler: [authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['amount', 'orderId'],
          properties: {
            amount: { type: 'number', minimum: 1 },
            currency: { type: 'string', default: 'INR' },
            orderId: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      }
    }, 
    PaymentController.createPaymentIntent
  );

  // Process refund
  fastify.post('/refund', 
    { 
      preHandler: [authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['paymentIntentId'],
          properties: {
            paymentIntentId: { type: 'string' }
          }
        }
      }
    }, 
    PaymentController.initiateRefund
  );

  // Stripe webhook
  fastify.post('/webhook', 
    {
      config: {
        rawBody: true // Required for webhook signature verification
      }
    }, 
    PaymentController.handleWebhook
  );

  // Get payment history
  fastify.get('/history',
    { preHandler: [authenticate] },
    PaymentController.getPaymentHistory
  );
}

module.exports = paymentRoutes;