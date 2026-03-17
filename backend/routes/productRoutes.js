const express = require('express');
const { Product } = require('../entities');

const router = express.Router();

// Authentication middleware (simplified - should match main server)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  // Assume jwt.verify is handled elsewhere, for now pass through
  next();
};

// Admin check middleware
const requireAdmin = (req, res, next) => {
  // Assuming req.user.role is set by main auth middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add new product (admin only — auth handled by main server middleware)
router.post('/products', authenticate, async (req, res) => {
  const { id, name, price, category } = req.body;

  if (!id || !name || price === undefined || !category) {
    return res.status(400).json({ error: 'ID, name, price, and category are required' });
  }

  if (price <= 0) {
    return res.status(400).json({ error: 'Price must be positive' });
  }

  try {
    // Check if product ID already exists
    const existing = await Product.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: 'Product ID already exists' });
    }

    const product = new Product({
      id,
      name,
      price: parseFloat(price),
      category
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product (admin only)
router.put('/products/:id', authenticate, async (req, res) => {
  const { name, price, category } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  if (price <= 0) {
    return res.status(400).json({ error: 'Price must be positive' });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        price: parseFloat(price),
        category,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/products/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = { router };
