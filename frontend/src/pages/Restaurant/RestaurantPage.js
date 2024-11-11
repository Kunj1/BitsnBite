import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import classes from './restaurantPage.module.css';
import { getRestaurantById } from '../../services/restaurantService';
import StarRating from '../../components/StarRating/StarRating';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../hooks/useAuth';

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    getRestaurantById(id).then(setRestaurant);
  }, [id]);

  if (!restaurant) return <Loading />;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name} 
          className={classes.image}
        />
        <div className={classes.info}>
          <h1>{restaurant.name}</h1>
          <div className={classes.cuisine}>{restaurant.cuisine.join(', ')}</div>
          <div className={classes.address}>{restaurant.address}</div>
          <div className={classes.details}>
            <StarRating stars={restaurant.rating} />
            <div className={classes.timing}>
              {restaurant.deliveryTime} mins delivery time
            </div>
            <div className={classes.cost}>
              ₹{restaurant.priceForTwo} for two
            </div>
            {restaurant.minOrderAmount && (
              <div className={classes.minOrder}>
                Min order ₹{restaurant.minOrderAmount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}