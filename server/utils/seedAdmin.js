const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_application_tracker';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to database for admin seeding...');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jobtracker.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Administrator';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`ℹ️  Admin user (${adminEmail}) already exists. Ensuring admin role and password...`);
      admin.name = adminName;
      admin.role = 'admin';
      admin.isBlocked = false;
      admin.password = adminPassword;
      await admin.save();
      console.log('✅ Admin credentials updated successfully.');
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isBlocked: false,
        headline: 'System Administrator & Platform Lead',
        skills: ['Cloud Architecture', 'DevOps', 'Cybersecurity', 'Database Management'],
      });
      console.log('🎉 Admin account created successfully!');
    }

    console.log('\n=========================================');
    console.log('🔑 ADMIN LOGIN CREDENTIALS:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     admin`);
    console.log('=========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
