import { model, Schema } from 'mongoose';

export const RestaurantSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
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

export const RestaurantModel = model('restaurant', RestaurantSchema);