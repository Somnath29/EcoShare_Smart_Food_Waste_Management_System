import mongoose from 'mongoose';
import { seedAdmin } from '../utils/seedAdmin.js';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/food_waste_db';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Automatically seed and maintain the single dedicated Admin user
    await seedAdmin();
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB:`, error);
    process.exit(1);
  }
};

