import mongoose from 'mongoose';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/food_waste_db');
    const db = mongoose.connection;
    const all = await db.collection('foods').find({ 
      updatedAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } 
    }).toArray();
    console.log(JSON.stringify(all, null, 2));
    mongoose.disconnect();
  } catch(e) {
    console.error(e);
  }
})();
