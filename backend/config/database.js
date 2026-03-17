const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

module.exports = connectDB;
