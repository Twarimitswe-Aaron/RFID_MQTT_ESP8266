const { connectDB } = require('../config/config');
const { Product } = require('../entities');
const mongoose = require('mongoose');

const initialProducts = [
  // Food & Beverages
  { id: 'coffee', name: 'Coffee', price: 2.50, category: 'food' },
  { id: 'sandwich', name: 'Sandwich', price: 5.00, category: 'food' },
  { id: 'water', name: 'Water Bottle', price: 1.00, category: 'food' },
  { id: 'snack', name: 'Snack Pack', price: 3.00, category: 'food' },
  { id: 'juice', name: 'Fresh Juice', price: 3.50, category: 'food' },
  { id: 'salad', name: 'Salad Bowl', price: 6.00, category: 'food' },
  { id: 'chips', name: 'Chips', price: 2.50, category: 'food' },

  // Rwandan Local Foods
  { id: 'brochette', name: 'Brochette', price: 4.00, category: 'rwandan' },
  { id: 'isombe', name: 'Isombe', price: 3.50, category: 'rwandan' },
  { id: 'ubugari', name: 'Ubugari', price: 2.00, category: 'rwandan' },
  { id: 'sambaza', name: 'Sambaza (Fried)', price: 3.00, category: 'rwandan' },
  { id: 'akabenzi', name: 'Akabenzi (Pork)', price: 5.50, category: 'rwandan' },
  { id: 'ikivuguto', name: 'Ikivuguto (Yogurt)', price: 1.50, category: 'rwandan' },
  { id: 'agatogo', name: 'Agatogo', price: 4.50, category: 'rwandan' },
  { id: 'urwagwa', name: 'Urwagwa (Banana Beer)', price: 2.50, category: 'rwandan' },

  // Drinks
  { id: 'fanta', name: 'Fanta', price: 1.20, category: 'drinks' },
  { id: 'primus', name: 'Primus Beer', price: 2.00, category: 'drinks' },
  { id: 'mutzig', name: 'Mutzig Beer', price: 2.00, category: 'drinks' },
  { id: 'inyange-juice', name: 'Inyange Juice', price: 1.50, category: 'drinks' },

  // Domain Registration
  { id: 'domain-com', name: '.com Domain', price: 12.00, category: 'domains' },
  { id: 'domain-net', name: '.net Domain', price: 11.00, category: 'domains' },
  { id: 'domain-org', name: '.org Domain', price: 10.00, category: 'domains' },
  { id: 'domain-io', name: '.io Domain', price: 35.00, category: 'domains' },
  { id: 'domain-dev', name: '.dev Domain', price: 15.00, category: 'domains' },
  { id: 'domain-app', name: '.app Domain', price: 18.00, category: 'domains' },
  { id: 'domain-ai', name: '.ai Domain', price: 80.00, category: 'domains' },
  { id: 'domain-xyz', name: '.xyz Domain', price: 8.00, category: 'domains' },
  { id: 'domain-co', name: '.co Domain', price: 25.00, category: 'domains' },
  { id: 'domain-rw', name: '.rw Domain', price: 20.00, category: 'domains' },

  // Digital Services
  { id: 'hosting-basic', name: 'Basic Hosting (1mo)', price: 5.00, category: 'services' },
  { id: 'hosting-pro', name: 'Pro Hosting (1mo)', price: 15.00, category: 'services' },
  { id: 'ssl-cert', name: 'SSL Certificate', price: 10.00, category: 'services' },
  { id: 'email-pro', name: 'Professional Email', price: 8.00, category: 'services' },
];

async function seedProducts() {
  await connectDB();
  try {
    await Product.deleteMany({});
    console.log('Cleared existing products');
    const products = await Product.insertMany(initialProducts);
    console.log(`Seeded ${products.length} products`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedProducts();
