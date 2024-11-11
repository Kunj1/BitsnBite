import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createOrder } from '../../services/orderService';
import classes from './checkoutPage.module.css';
import Title from '../../components/Title/Title';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Map from '../../components/Map/Map';

export default function CheckoutPage() {
  const { cart} = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState({ ...cart });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const submit = async data => {
    if (!order.addressLatLng) {
      toast.warning('Please select your location on the map');
      return;
    }
  
    try {
      setIsSubmitting(true);

      const orderData = {
        ...order,
        name: data.name,
        address: data.address,
        items: cart.items.map(item => ({
          food: {
            ...item.food,
            isVeg: item.food.isVeg ?? false,
            category: item.food.category || 'Other',
          },
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: cart.totalPrice,
        status: 'NEW',
        user: user.id,
      };
  
      await createOrder(orderData);
      navigate('/payment');
    } catch (error) {
      toast.error('Failed to create order: ' + (error.response?.data?.message || error.message));
      console.error('Order creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes["content-wrapper"]}>
        {/* Left column */}
        <div className={classes["left-column"]}>
          <Title title="Order Checkout" />
          
          <div className={classes.summary}>
            <div className={classes.information}>
              <h3>Order Information</h3>
              <div className={classes.details}>
                <Input
                  defaultValue={user.name}
                  label="Name"
                  {...register('name', {
                    required: true,
                    minLength: 3,
                  })}
                  error={errors.name}
                />
                <Input
                  defaultValue={user.address}
                  label="Address"
                  {...register('address', {
                    required: true,
                    minLength: 10,
                  })}
                  error={errors.address}
                />
              </div>
            </div>
  
            <OrderItemsList order={order} />
          </div>
        </div>
  
        {/* Right column */}
        <div className={classes["right-column"]}>
          <h3>Choose Your Location</h3>
          <Map
            location={order.addressLatLng}
            onChange={latlng => {
              setOrder({ ...order, addressLatLng: latlng });
            }}
          />
        </div>
      </div>
  
      {/* Centered button */}
      <div className={classes.buttons_container}>
        <div className={classes.buttons}>
          <Button
            type="submit"
            text={isSubmitting ? 'Processing...' : 'Go To Payment'}
            width="100%"
            height="3rem"
            onClick={handleSubmit(submit)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}  