import { Router } from 'express';
import handler from 'express-async-handler';
import auth from '../middleware/auth.mid.js';
import { RestaurantModel } from '../models/restaurant.model.js';
import { UserModel } from '../models/user.model.js';

const router = Router();

// Get all restaurants with optional search and filters
router.get(
  '/search/:searchTerm?',
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const { cuisine, veg, minRating, sortBy } = req.query;

    const searchRegex = new RegExp(searchTerm, 'i');
    
    let query = {};
    if (searchTerm) {
      query.$or = [
        { name: searchRegex },
        { cuisine: searchRegex }
      ];
    }
    if (cuisine) query.cuisine = cuisine;
    if (veg) query.isVeg = veg === 'true';
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    let restaurants = await RestaurantModel.find(query);

    // Simple sorting
    if (sortBy) {
      switch (sortBy) {
        case 'rating':
          restaurants.sort((a, b) => b.rating - a.rating);
          break;
        case 'price':
          restaurants.sort((a, b) => a.priceForTwo - b.priceForTwo);
          break;
        case 'time':
          restaurants.sort((a, b) => 
            parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
          break;
      }
    }

    res.send(restaurants);
  })
);

// Get restaurant by ID
router.get(
  '/:id',
  handler(async (req, res) => {
    const restaurant = await RestaurantModel.findById(req.params.id);
    res.send(restaurant);
  })
);

// Toggle favorite restaurant (requires auth)
router.put(
  '/favorite/:restaurantId',
  auth,
  handler(async (req, res) => {
    const { restaurantId } = req.params;
    
    const user = await UserModel.findById(req.user.id);
    const favorites = user.favorites || [];

    const isExisting = favorites.includes(restaurantId);
    if (isExisting) {
      user.favorites = favorites.filter(id => id !== restaurantId);
    } else {
      user.favorites = [...favorites, restaurantId];
    }

    await user.save();
    res.send(user.favorites);
  })
);

// Get all cuisines (for filters)
router.get(
  '/cuisines/all',
  handler(async (req, res) => {
    const cuisines = [
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
    res.send(cuisines);
  })
);

// Add demo data
router.get(
  '/seed/data',
  handler(async (req, res) => {
    const sampleRestaurants = [
      {
        name: 'Punjabi Tadka',
        cuisine: ['North Indian', 'Punjabi'],
        address: 'Sector 18, Noida',
        addressLatLng: { lat: '28.5707', lng: '77.3219' },
        imageUrl: '/restaurant1.jpg',
        rating: 4.5,
        totalRatings: 1200,
        minOrderAmount: 200,
        deliveryTime: '30-40',
        priceForTwo: 500,
        isVeg: false
      },
      {
        name: 'Dosa Plaza',
        cuisine: ['South Indian'],
        address: 'Connaught Place, Delhi',
        addressLatLng: { lat: '28.6289', lng: '77.2065' },
        imageUrl: '/restaurant2.jpg',
        rating: 4.2,
        totalRatings: 800,
        minOrderAmount: 150,
        deliveryTime: '25-35',
        priceForTwo: 300,
        isVeg: true
      }
    ];

    await RestaurantModel.deleteMany({});
    await RestaurantModel.insertMany(sampleRestaurants);
    res.send('Seeded Successfully');
  })
);

export default router;