const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'cash_on_delivery'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  refundId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);