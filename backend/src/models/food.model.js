import { model, Schema } from 'mongoose';

export const FoodSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String] },
    favorite: { type: Boolean, default: false },
    stars: { type: Number, default: 3 },
    imageUrl: { type: String, required: true },
    origins: { type: [String], required: true },
    cookTime: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Starters', 'Main Course', 'Desserts'
    isVeg: { type: Boolean, required: true },
    customization: [{
      name: String,
      options: [{
        name: String,
        price: Number
      }]
    }]
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

export const FoodModel = model('food', FoodSchema);
