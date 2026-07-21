import { User } from '../models/User.js';

export const seedAdmin = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@ecoshare.com';
    const adminPassword = 'Admin@EcoShare2026';

    // Ensure no other accounts have Admin role
    await User.updateMany(
      { role: 'Admin', email: { $ne: adminEmail } },
      { role: 'Student' }
    );

    // Check if the single dedicated Admin user exists
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
      });
      console.log(`[Seed] Single Admin user created: ${adminEmail}`);
    } else {
      if (adminUser.role !== 'Admin') {
        adminUser.role = 'Admin';
        await adminUser.save();
      }
      console.log(`[Seed] Admin user verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed Admin user:', error);
  }
};
