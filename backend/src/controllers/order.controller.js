const OrderService = require('../services/order.service');
const logger = require('../config/logger.config');

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  createOrder(request, reply) {
    const { user } = request;
    const orderData = request.body;
    
    this.orderService.createOrder({
      ...orderData,
      user: user._id
    })
      .then(order => {
        return reply.status(201).send({
          success: true,
          data: order
        });
      })
      .catch(error => {
        logger.error('Error creating order:', error);
        throw new FastifyError(error.message);
      });
  }

  getOrders(request, reply) {
    const { user } = request;
    const { status, page = 1, limit = 10 } = request.query;

    this.orderService.getOrders(user._id, status, {
      page: parseInt(page),
      limit: parseInt(limit)
    })
      .then(orders => {
        reply.send({
          success: true,
          data: orders
        });
      })
      .catch(error => {
        logger.error('Error fetching orders:', error);
        throw new FastifyError(error.message);
      });
  }

  getOrderById(request, reply) {
    const { id } = request.params;
    const { user } = request;

    this.orderService.getOrderById(id, user._id)
      .then(order => {
        if (!order) {
          return reply.status(404).send({
            success: false,
            message: 'Order not found'
          });
        }

        reply.send({
          success: true,
          data: order
        });
      })
      .catch(error => {
        logger.error('Error fetching order:', error);
        throw new FastifyError(error.message);
      });
  }

  updateOrderStatus(request, reply) {
    const { id } = request.params;
    const { status } = request.body;
    const { user } = request;

    this.orderService.updateOrderStatus(id, status, user._id)
      .then(updatedOrder => {
        if (!updatedOrder) {
          return reply.status(404).send({
            success: false,
            message: 'Order not found'
          });
        }

        reply.send({
          success: true,
          data: updatedOrder
        });
      })
      .catch(error => {
        logger.error('Error updating order status:', error);
        throw new FastifyError(error.message);
      });
  }

  cancelOrder(request, reply) {
    const { id } = request.params;
    const { user } = request;
    const { reason } = request.body;

    this.orderService.cancelOrder(id, user._id, reason)
      .then(cancelledOrder => {
        if (!cancelledOrder) {
          return reply.status(404).send({
            success: false,
            message: 'Order not found'
          });
        }

        reply.send({
          success: true,
          data: cancelledOrder,
          message: 'Order cancelled successfully'
        });
      })
      .catch(error => {
        logger.error('Error cancelling order:', error);
        throw new FastifyError(error.message);
      });
  }
}

module.exports = new OrderController();