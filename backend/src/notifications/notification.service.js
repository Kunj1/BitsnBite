const emailConfig = require('../config/email.config.js');
const logger = require('../config/logger.config.js');

class NotificationService {
  async sendEmail(to, subject, message, html = null) {
    try {
      await emailConfig.send({
        to,
        subject,
        text: message,
        html: html || `<p>${message}</p>`
      });

      logger.info('Email sent successfully', { to, subject });
    } catch (error) {
      logger.error('Failed to send email', { error, to, subject });
      throw error;
    }
  }
  
  async sendOrderConfirmation(order, user) {
    try {
      const subject = `Order Confirmation - Order #${order._id}`;
      const text = `Your order has been confirmed! Order ID: ${order._id}`;
      const html = `
        <h1>Order Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Your order #${order._id} has been confirmed and is being processed.</p>
        <h2>Order Details:</h2>
        <p>Total Amount: $${order.totalAmount}</p>
        <p>Delivery Address: ${order.deliveryAddress}</p>
        <p>Estimated Delivery Time: ${order.estimatedDeliveryTime}</p>
        <p>Thank you for choosing our service!</p>
      `;

      await this.sendEmail(user.email, subject, text, html);
    } catch (error) {
      logger.error('Failed to send order confirmation email', { error, orderId: order._id });
      throw error;
    }
  }

  async sendOTP(email, otp) {
    try {
      const subject = 'Your OTP Code';
      const text = `Your OTP code is: ${otp}`;
      const html = `
        <h1>Your OTP Code</h1>
        <p>Use the following code to verify your account:</p>
        <h2 style="font-size: 24px; color: #4CAF50;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `;

      await emailConfig.send({
        to: email,
        subject,
        text,
        html
      });

      logger.info('OTP email sent', { email });
    } catch (error) {
      logger.error('Failed to send OTP email', { error, email });
      throw error;
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      const subject = 'Password Reset Request';
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const text = `Click the following link to reset your password: ${resetLink}`;
      const html = `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `;

      await emailConfig.send({
        to: email,
        subject,
        text,
        html
      });

      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Failed to send password reset email', { error, email });
      throw error;
    }
  }

  async sendOrderStatusUpdate(order, user, status) {
    try {
      const subject = `Order Status Update - Order #${order._id}`;
      const text = `Your order status has been updated to: ${status}`;
      const html = `
        <h1>Order Status Update</h1>
        <p>Dear ${user.name},</p>
        <p>Your order #${order._id} has been updated to: <strong>${status}</strong></p>
        <h2>Order Details:</h2>
        <p>Status: ${status}</p>
        <p>Updated At: ${new Date().toLocaleString()}</p>
        <p>Thank you for your patience!</p>
      `;

      await this.sendEmail(user.email, subject, text, html);
    } catch (error) {
      logger.error('Failed to send order status update email', { error, orderId: order._id });
      throw error;
    }
  }
}

module.exports= new NotificationService();