const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { connectDB } = require('../config/config');
const { User } = require('../entities');

const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'agent', password: 'agent123', role: 'agent' },
  { username: 'salesperson', password: 'user123', role: 'user' },
];

async function seedUsers() {
  await connectDB();
  try {
    for (const userData of users) {
      const existing = await User.findOne({ username: userData.username });
      if (existing) {
        console.log(`User "${userData.username}" already exists, skipping`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await new User({ ...userData, password: hashedPassword }).save();
      console.log(`Seeded user: ${userData.username} (${userData.role})`);
    }
    console.log('User seeding complete');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
