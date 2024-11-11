import React, { useState, useEffect } from 'react';
import { getAllRestaurants, sortRestaurants } from '../../services/restaurantService';
import {RestaurantCard} from '../../components/RestaurantCard/RestaurantCard';
import { useParams } from 'react-router-dom';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const { searchTerm } = useParams();
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, [searchTerm]);

  const loadRestaurants = async () => {
    const data = await getAllRestaurants(searchTerm);
    setRestaurants(data);
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sortedRestaurants = sortRestaurants(restaurants, criteria);
    setRestaurants(sortedRestaurants);
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Enter location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded"
        />
        <select 
          value={sortBy} 
          onChange={(e) => handleSort(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Sort By</option>
          <option value="rating">Rating</option>
          <option value="price">Price</option>
          <option value="distance">Distance</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map(restaurant => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}