import { Document, Types, Model } from 'mongoose';

export type FoodStatus = 'Available' | 'Reserved' | 'Collected' | 'Expired';

export interface IFood extends Document {
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  expiryTime: Date;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  image?: string;
  status: FoodStatus;
  createdBy: Types.ObjectId;
  reservedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FoodModel = Model<IFood>;
