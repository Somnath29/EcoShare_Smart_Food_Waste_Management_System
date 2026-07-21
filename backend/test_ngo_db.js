import mongoose from 'mongoose';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/food_waste_db');
    const db = mongoose.connection;
    const ngoFoods = await db.collection('foods').find({
      status: 'Available',
      $or: [
        { isForDonation: true },
        { expiryTime: { $lte: new Date() } }
      ]
    }).toArray();
    console.log("NGO Visible foods:", ngoFoods.length);
    console.log(ngoFoods.map(f => `${f.title} (Qty: ${f.quantity}, isForDonation: ${f.isForDonation})`));
    mongoose.disconnect();
  } catch(e) {
    console.error(e);
  }
})();
