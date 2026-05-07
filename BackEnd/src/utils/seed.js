/**
 * Seed script: creates a default admin user if none exists.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('🍃 Connected to MongoDB');

    const User = require('../models/User');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    // Create default admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@mbo.com',
      passwordHash: 'Admin@1234', // pre-save hook will hash this
      role: 'admin',
      level: null,
      isActive: true,
    });

    console.log(`✅ Default admin created:`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: Admin@1234`);
    console.log(`   ⚠️  Change this password immediately in production!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
