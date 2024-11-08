const PaymentService = require('../services/payment.service');
const Payment = require('../models/Payment');
const logger = require('../config/logger.config');

class PaymentController {
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'INR', metadata, orderId } = req.body;
      const user = req.user; // From auth middleware

      // Create payment record
      const payment = await Payment.create({
        user: user._id,
        order: orderId,
        amount,
        method: metadata.paymentMethod || 'credit_card',
        status: 'pending'
      });

      // Add payment tracking info to metadata
      const enrichedMetadata = {
        ...metadata,
        paymentId: payment._id.toString(),
        userEmail: user.email,
        userId: user._id.toString()
      };

      const paymentIntent = await PaymentService.createPaymentIntent(
        amount, 
        currency, 
        enrichedMetadata,
        user.email
      );

      res.status(201).json({ 
        success: true, 
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id 
      });
    } catch (error) {
      logger.error('Error in createPaymentIntent:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const event = await PaymentService.verifyWebhook(req.rawBody, sig);

      // Update payment record based on webhook event
      if (event.type === 'payment_intent.succeeded') {
        const { paymentId } = event.data.object.metadata;
        await Payment.findByIdAndUpdate(paymentId, {
          status: 'success',
          updatedAt: new Date()
        });
      }

      if (event.type === 'payment_intent.payment_failed') {
        const { paymentId } = event.data.object.metadata;
        await Payment.findByIdAndUpdate(paymentId, {
          status: 'failed',
          updatedAt: new Date()
        });
      }

      res.status(200).send({ received: true });
    } catch (error) {
      logger.error('Error in handleWebhook:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async initiateRefund(req, res) {
    try {
      const { paymentIntentId } = req.body;
      const user = req.user;

      // Verify payment belongs to user
      const payment = await Payment.findOne({
        user: user._id,
        'stripePaymentIntentId': paymentIntentId
      });

      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Payment not found or unauthorized' 
        });
      }

      const refund = await PaymentService.refundPayment(paymentIntentId, user.email);
      
      // Update payment status
      payment.status = 'refunded';
      payment.updatedAt = new Date();
      await payment.save();

      res.status(200).json({ success: true, refund });
    } catch (error) {
      logger.error('Error in initiateRefund:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const payments = await Payment.find({ user: req.user._id })
        .populate('order')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, payments });
    } catch (error) {
      logger.error('Error in getPaymentHistory:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController();