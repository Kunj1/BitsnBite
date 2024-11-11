import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavorite } from '../../services/restaurantService';
import { Heart } from 'lucide-react';

export const RestaurantCard = ({ restaurant }) => {
  const { user } = useAuth();
  const isFavorite = user?.favoriteRestaurants?.includes(restaurant._id);

  return (
    <div className="w-80 bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/restaurant/${restaurant._id}`}>
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
          <button 
            onClick={() => toggleFavorite(restaurant._id)}
            className="p-2"
          >
            <Heart 
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
              size={24} 
            />
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>{restaurant.cuisine.join(', ')}</p>
          <p>₹{restaurant.priceForTwo} for two</p>
          <div className="flex items-center mt-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {restaurant.rating} ★
            </span>
            <span className="ml-2">{restaurant.deliveryTime}</span>
            {restaurant.isVeg && (
              <span className="ml-2 text-green-600">🟢 Pure Veg</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
