const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { User } = require('../../database/entities');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Seed users
async function seedUsers() {
  try {
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'user',
        password: 'user123',
        role: 'user'
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`Seeded user: ${userData.username} (${userData.role})`);
    }

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding
async function run() {
  await connectDB();
  await seedUsers();
}

run();
