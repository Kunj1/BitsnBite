const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  cuisineTypes: {  // renamed from cuisine for consistency
    type: [String],
    required: true
  },
  menu: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isGlutenFree: {
      type: Boolean,
      default: false
    },
    spicyLevel: {
      type: Number,
      min: 0,
      max: 3,
      default: 0
    },
    image: {
      type: String
    }
  }],
  images: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
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

// Add index for search functionality
restaurantSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);