import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants, toggleFavorite } from '../../services/restaurantService';
import { useAuth } from '../../hooks/useAuth';
import Search from '../../components/Search/Search';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const cuisineTypes = [
    'North Indian',
    'South Indian',
    'Chinese',
    'Fast Food',
    'Pizza',
    'Biryani',
    'Bengali',
    'Street Food',
    'Desserts'
  ];

  useEffect(() => {
    loadRestaurants();
  }, [searchTerm, selectedCuisine, vegOnly, sortBy]);

  const loadRestaurants = async () => {
    const data = await getAllRestaurants(searchTerm);
    let filtered = data;

    if (selectedCuisine) {
      filtered = filtered.filter(r => r.cuisine.includes(selectedCuisine));
    }

    if (vegOnly) {
      filtered = filtered.filter(r => r.isVeg);
    }

    if (sortBy) {
      switch (sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'price':
          filtered.sort((a, b) => a.priceForTwo - b.priceForTwo);
          break;
        case 'time':
          filtered.sort((a, b) => 
            parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
          break;
      }
    }

    setFilteredRestaurants(filtered);
  };

  const handleFavorite = async (restaurantId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFavorite(restaurantId);
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <Search
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search restaurants by name or cuisine..."
        />
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Cuisines</option>
          {cuisineTypes.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Sort By</option>
          <option value="rating">Rating</option>
          <option value="price">Price: Low to High</option>
          <option value="time">Delivery Time</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
          />
          Pure Veg
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
            onFavoriteClick={() => handleFavorite(restaurant._id)}
            isFavorite={user?.favorites?.includes(restaurant._id)}
          />
        ))}
      </div>
    </div>
  );
}