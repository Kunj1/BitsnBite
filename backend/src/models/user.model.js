import { model, Schema } from 'mongoose';

export const AddressSchema = new Schema({
  type: { type: String, required: true }, // 'Home', 'Work', 'Other'
  address: { type: String, required: true },
  landmark: { type: String },
  addressLatLng: {
    lat: { type: String, required: true },
    lng: { type: String, required: true },
  }
});

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addresses: [AddressSchema],
    defaultAddress: { type: Number, default: 0 }, // Index of default address
    favoriteRestaurants: [{ type: Schema.Types.ObjectId, ref: 'restaurant' }],
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    phone: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const UserModel = model('user', UserSchema);
