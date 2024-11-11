import React, { useState, useEffect } from 'react';
import classes from './paymentPage.module.css';
import { getNewOrderForCurrentUser } from '../../services/orderService';
import Title from '../../components/Title/Title';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Map from '../../components/Map/Map';
import PaypalButtons from '../../components/PaypalButtons/PaypalButtons';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useCart } from '../../hooks/useCart';

export default function PaymentPage() {
  const { cart } = useCart();
  const [order, setOrder] = useState();
  const [tip, setTip] = useState(0);
  const [pendingTip, setPendingTip] = useState('');
  const [tipError, setTipError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  // Dummy discount codes
  const discounts = {
    'FIRST50': 50,
    'BITSNBITE100': 100,
  };

  useEffect(() => {
    getNewOrderForCurrentUser().then(data => {
      setOrder(data);
      setFinalAmount(cart.totalPrice);
    });
  }, [cart.totalPrice]);

  const applyDiscount = () => {
    const discount = discounts[discountCode] || 0;
    const newAmount = order.totalPrice - discount + Number(tip);
    setFinalAmount(newAmount > 0 ? newAmount : 0);
  };

  const handleTipChange = (e) => {
    const value = e.target.value;
    setTipError('');
    if (value === '') {
      setPendingTip('');
    } else if (Number(value) < 0) {
      setTipError('Tip amount cannot be negative');
    } else {
      setPendingTip(value);
    }
  };

  const applyTip = () => {
    if (pendingTip && Number(pendingTip) >= 0) {
      const newTip = Number(pendingTip);
      setTip(newTip);
      setFinalAmount(order.totalPrice - (discounts[discountCode] || 0) + newTip);
    }
  };

  if (!order) return;

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <Title title="Order Summary" fontSize="1.6rem" />
        <div className={classes.orderCard}>
          <div className={classes.summary}>
            <div>
              <h3>Name:</h3>
              <span>{order.name}</span>
            </div>
            <div>
              <h3>Address:</h3>
              <span>{order.address}</span>
            </div>
          </div>
          
          <div className={classes.itemsList}>
            <OrderItemsList order={order} />
          </div>

          <div className={classes.priceDetails}>
            <div className={classes.priceRow}>
              <span>Order Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
            {discounts[discountCode] && (
              <div className={classes.priceRow}>
                <span>Discount</span>
                <span className={classes.discountText}>-₹{discounts[discountCode]}</span>
              </div>
            )}
            {tip > 0 && (
              <div className={classes.priceRow}>
                <span>Delivery Partner Tip</span>
                <span>₹{tip}</span>
              </div>
            )}
            <div className={`${classes.priceRow} ${classes.finalAmount}`}>
              <span>Final Amount</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={classes.mapSection}>
        <Title title="Delivery Location" fontSize="1.6rem" />
        <Map readonly={true} location={order.addressLatLng} />
        
        <div className={classes.actionsContainer}>
          <div className={classes.discountSection}>
            <Input 
              label="Have a discount code?"
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
              placeholder="Enter code"
            />
            <Button onClick={applyDiscount} className={classes.applyButton}>
              Apply
            </Button>
          </div>

          <div className={classes.tipSection}>
            <Input
              type="number"
              label="Add Tip for Delivery Partner"
              value={pendingTip}
              onChange={handleTipChange}
              placeholder="Enter amount"
            />
            {tipError && <div className={classes.errorMessage}>{tipError}</div>}
            <Button onClick={applyTip} className={classes.applyButton}>
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className={classes.paymentButtons}>
        <PaypalButtons order={{...order, totalPrice: finalAmount}} />
      </div>
    </div>
  );
}