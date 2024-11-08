const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Payment = require('../models/Payment');
const logger = require('../config/logger.config');
const notificationService = require('../notifications/notification.service'); 

class OrderService {
  createOrder(orderData) {
    return new Promise((resolve, reject) => {
      let createdOrder;
      // Validate restaurant availability
      Restaurant.findById(orderData.restaurant)
        .then(restaurant => {
          if (!restaurant || !restaurant.isActive) {
            throw new Error('Restaurant is not available');
          }

          // Calculate total amount
          let totalAmount = 0;
          const itemPromises = orderData.items.map(item => {
            return restaurant.menu.id(item.item)
              .then(menuItem => {
                if (!menuItem) {
                  throw new Error(`Menu item ${item.item} not found`);
                }
                totalAmount += menuItem.price * item.quantity;
              });
          });

          return Promise.all(itemPromises).then(() => {
            // Create new order
            const order = new Order({
              ...orderData,
              totalAmount,
              status: 'placed'
            });

            return order.save()
              .then(() => order.populate([
                { path: 'user', select: 'name email phone' },
                { path: 'restaurant', select: 'name email phone address' },
                { path: 'address' },
                { path: 'payment' }
              ]));
          });
        })
        .then(async (order) => {
          createdOrder = order;
          
          // Send notifications after order creation
          await Promise.all([
            notificationService.sendOrderConfirmation(order, order.user),
            notificationService.sendEmail(
              order.restaurant.email,
              `New Order #${order._id}`,
              `You have received a new order from ${order.user.name}`,
              `
                <h1>New Order Received</h1>
                <p>Order #${order._id}</p>
                <p>Customer: ${order.user.name}</p>
                <p>Total Amount: $${order.totalAmount}</p>
              `
            )
          ]);
          
          resolve(createdOrder);
        })
        .catch(error => {
          logger.error('Error in createOrder service:', error);
          reject(error);
        });
    });
  }

  getOrders(userId, status, pagination) {
    return new Promise((resolve, reject) => {
      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      let orderData = {};

      Order.find(query)
        .populate([
          { path: 'restaurant', select: 'name address' },
          { path: 'items.item', select: 'name price' }
        ])
        .sort({ createdAt: -1 })
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .then(orders => {
          orderData.orders = orders;
          return Order.countDocuments(query);
        })
        .then(total => {
          orderData.pagination = {
            total,
            page: pagination.page,
            pages: Math.ceil(total / pagination.limit)
          };
          resolve(orderData);
        })
        .catch(error => {
          logger.error('Error in getOrders service:', error);
          reject(error);
        });
    });
  }

  getOrderById(orderId, userId) {
    return new Promise((resolve, reject) => {
      Order.findOne({
        _id: orderId,
        user: userId
      })
        .populate([
          { path: 'restaurant', select: 'name address phone' },
          { path: 'items.item', select: 'name price' },
          { path: 'address' },
          { path: 'payment' }
        ])
        .then(order => resolve(order))
        .catch(error => {
          logger.error('Error in getOrderById service:', error);
          reject(error);
        });
    });
  }

  updateOrderStatus(orderId, status, userId) {
    return new Promise((resolve, reject) => {
      let updatedOrder;
      
      Order.findById(orderId)
        .populate([
          { path: 'user', select: 'name email phone' },
          { path: 'restaurant', select: 'name email phone address' }
        ])
        .then(order => {
          if (!order) {
            throw new Error('Order not found');
          }

          // Verify status transition validity
          const validTransitions = {
            'placed': ['accepted', 'cancelled'],
            'accepted': ['preparing', 'cancelled'],
            'preparing': ['delivered', 'cancelled'],
            'delivered': [],
            'cancelled': []
          };

          if (!validTransitions[order.status].includes(status)) {
            throw new Error(`Invalid status transition from ${order.status} to ${status}`);
          }

          order.status = status;
          order.updatedAt = Date.now();
          updatedOrder = order;
          
          return order.save();
        })
        .then(async () => {
          // Send status update notification to customer
          await notificationService.sendOrderStatusUpdate(updatedOrder, updatedOrder.user, status);
          
          // Send feedback request if order is delivered
          if (status === 'delivered') {
            await notificationService.sendEmail(
              updatedOrder.user.email,
              `Feedback Request - Order #${updatedOrder._id}`,
              'Please share your feedback about your recent order',
              `
                <h1>How was your order?</h1>
                <p>Dear ${updatedOrder.user.name},</p>
                <p>We hope you enjoyed your order! Please take a moment to share your feedback.</p>
                <p>Order #${updatedOrder._id}</p>
              `
            );
          }
          
          resolve(updatedOrder);
        })
        .catch(error => {
          logger.error('Error in updateOrderStatus service:', error);
          reject(error);
        });
    });
  }

  cancelOrder(orderId, userId, reason) {
    return new Promise((resolve, reject) => {
      let orderToCancel;

      Order.findOne({ _id: orderId, user: userId })
        .populate([
          { path: 'user', select: 'name email phone' },
          { path: 'restaurant', select: 'name email phone address' }
        ])
        .then(async (order) => {
          if (!order) {
            throw new Error('Order not found');
          }

          if (!['placed', 'accepted'].includes(order.status)) {
            throw new Error('Order cannot be cancelled at this stage');
          }

          orderToCancel = order;
          
          if (order.payment) {
            const payment = await Payment.findById(order.payment);
            if (payment && payment.status === 'completed') {
              payment.status = 'refunded';
              await payment.save();
            }
          }

          order.status = 'cancelled';
          order.cancellationReason = reason;
          order.updatedAt = Date.now();
          
          return order.save();
        })
        .then(async (order) => {
          // Send cancellation notifications
          await Promise.all([
            notificationService.sendEmail(
              order.user.email,
              `Order Cancelled - Order #${order._id}`,
              `Your order has been cancelled. Reason: ${reason}`,
              `
                <h1>Order Cancellation</h1>
                <p>Dear ${order.user.name},</p>
                <p>Your order #${order._id} has been cancelled.</p>
                <p>Reason: ${reason}</p>
              `
            ),
            notificationService.sendEmail(
              order.restaurant.email,
              `Order Cancelled - Order #${order._id}`,
              `Order #${order._id} has been cancelled. Reason: ${reason}`,
              `
                <h1>Order Cancellation</h1>
                <p>Order #${order._id} has been cancelled</p>
                <p>Customer: ${order.user.name}</p>
                <p>Reason: ${reason}</p>
              `
            )
          ]);
          
          resolve(order);
        })
        .catch(error => {
          logger.error('Error in cancelOrder service:', error);
          reject(error);
        });
    });
  }
}

module.exports = OrderService;