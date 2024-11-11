import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import React, { useEffect, useState } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { pay } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import classes from './PaypalButtons.module.css';

export default function PaypalButtons({ order }) {
  const paypalOptions = {
    clientId: 'test',
    currency: 'INR',
    intent: 'capture',
  };
  return (
    <div className={classes.buttonsContainer}>
      <PayPalScriptProvider options={paypalOptions}>
        <Buttons order={order} />
      </PayPalScriptProvider>
      <TestPayButton order={order} />
    </div>
  );
}

function TestPayButton({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const demoPaymentId = 'TEST-' + Date.now();
      const orderId = await pay(demoPaymentId);
      clearCart();
      toast.success('Payment Successful!');
      navigate('/track/' + orderId);
    } catch (error) {
      toast.error('Payment Failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      className={classes.testPayButton}
      onClick={handleTestPayment}
      disabled={isProcessing}
    >
      {isProcessing ? 'Processing...' : 'TEST PAY (Demo)'}
    </button>
  );
}

function Buttons({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [{ isPending }] = usePayPalScriptReducer();
  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    isPending ? showLoading() : hideLoading();
  }, [isPending, hideLoading, showLoading]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'INR',
            value: order.totalPrice.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const payment = await actions.order.capture();
      const orderId = await pay(payment.id);
      clearCart();
      toast.success('Payment Saved Successfully', 'Success');
      navigate('/track/' + orderId);
    } catch (error) {
      toast.error('Payment Failed: ' + error.message);
    }
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) => toast.error('Payment Failed: ' + err.message)}
      style={{ layout: 'horizontal' }}
    />
  );
}