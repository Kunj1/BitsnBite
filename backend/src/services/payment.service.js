const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../config/logger.config');
const notificationService = require('../notifications/notification.service');

class PaymentService {
  async createPaymentIntent(amount, currency, metadata, userEmail) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        payment_method_types: ['card'],
      });

      // Send payment initiated email
      await notificationService.sendEmail(
        userEmail,
        'Payment Initiated',
        `A payment of ${(amount/100).toFixed(2)} ${currency.toUpperCase()} has been initiated.`,
        `
          <h1>Payment Initiated</h1>
          <p>A payment has been initiated with the following details:</p>
          <ul>
            <li>Amount: ${(amount/100).toFixed(2)} ${currency.toUpperCase()}</li>
            <li>Payment ID: ${paymentIntent.id}</li>
            <li>Status: ${paymentIntent.status}</li>
          </ul>
          <p>You will receive a confirmation email once the payment is completed.</p>
        `
      );

      return paymentIntent;
    } catch (error) {
      logger.error('Error in createPaymentIntent:', error);
      throw error;
    }
  }

  async verifyWebhook(payload, sig) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    // Handle successful payments
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userEmail = paymentIntent.metadata.userEmail; // Assuming email is stored in metadata

      // Send payment success email
      if (userEmail) {
        await notificationService.sendEmail(
          userEmail,
          'Payment Successful',
          `Your payment of ${(paymentIntent.amount/100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} was successful.`,
          `
            <h1>Payment Successful</h1>
            <p>Thank you for your payment! Here are the details:</p>
            <ul>
              <li>Amount: ${(paymentIntent.amount/100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</li>
              <li>Payment ID: ${paymentIntent.id}</li>
              <li>Date: ${new Date().toLocaleString()}</li>
            </ul>
            <p>This email serves as your payment receipt.</p>
          `
        );
      }
    }

    // Handle failed payments
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const userEmail = paymentIntent.metadata.userEmail;

      if (userEmail) {
        await notificationService.sendEmail(
          userEmail,
          'Payment Failed',
          `Your payment of ${(paymentIntent.amount/100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} was unsuccessful.`,
          `
            <h1>Payment Failed</h1>
            <p>Unfortunately, your payment could not be processed. Here are the details:</p>
            <ul>
              <li>Amount: ${(paymentIntent.amount/100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</li>
              <li>Payment ID: ${paymentIntent.id}</li>
              <li>Date: ${new Date().toLocaleString()}</li>
            </ul>
            <p>Please try again or contact support if you continue to experience issues.</p>
          `
        );
      }
    }

    return event;
  }

  async refundPayment(paymentIntentId, userEmail) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
        logger.info(`Refund successful for paymentIntentId: ${paymentIntentId}`);

        // Send refund confirmation email
        if (userEmail) {
          await notificationService.sendEmail(
            userEmail,
            'Refund Processed',
            `Your refund of ${(refund.amount/100).toFixed(2)} ${refund.currency.toUpperCase()} has been processed.`,
            `
              <h1>Refund Processed</h1>
              <p>Your refund has been processed successfully. Here are the details:</p>
              <ul>
                <li>Refund Amount: ${(refund.amount/100).toFixed(2)} ${refund.currency.toUpperCase()}</li>
                <li>Refund ID: ${refund.id}</li>
                <li>Original Payment ID: ${paymentIntentId}</li>
                <li>Date: ${new Date().toLocaleString()}</li>
              </ul>
              <p>The refunded amount should appear in your account within 5-10 business days, depending on your bank.</p>
            `
          );
        }

        return refund;
      } else {
        throw new Error('Payment not eligible for refund');
      }
    } catch (error) {
      logger.error('Error in refundPayment:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
