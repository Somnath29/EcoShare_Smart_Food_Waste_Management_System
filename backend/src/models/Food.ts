import { Schema, model } from 'mongoose';
import { IFood, FoodModel } from '../types/food.js';

const foodSchema = new Schema<IFood, FoodModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    image: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Reserved', 'Collected', 'Expired'],
        message: 'Invalid status: {VALUE}. Must be one of Available, Reserved, Collected, Expired',
      },
      default: 'Available',
    },
    isForDonation: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Food listing must belong to a user'],
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Food = model<IFood, FoodModel>('Food', foodSchema);
