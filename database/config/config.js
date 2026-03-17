const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const MONGO_URI =  process.env.MONGODB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = { MONGO_URI, connectDB };
