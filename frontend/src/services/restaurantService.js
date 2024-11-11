import axios from 'axios';

export const getAllRestaurants = async (searchTerm = '') => {
  const { data } = await axios.get('/api/restaurants' + (searchTerm ? '/search/' + searchTerm : ''));
  return data;
};

export const getRestaurantById = async (id) => {
  const { data } = await axios.get('/api/restaurants/' + id);
  return data;
};

export const toggleFavorite = async (restaurantId) => {
  const { data } = await axios.put('/api/restaurants/favorite/' + restaurantId);
  return data;
};

// Sort restaurants by criteria (rating, price, distance)
export const sortRestaurants = (restaurants, criteria) => {
  switch (criteria) {
    case 'rating':
      return [...restaurants].sort((a, b) => b.rating - a.rating);
    case 'price':
      return [...restaurants].sort((a, b) => a.priceForTwo - b.priceForTwo);
    case 'distance':
      // Dummy distance sorting based on delivery time
      return [...restaurants].sort((a, b) => 
        parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    default:
      return restaurants;
  }
};