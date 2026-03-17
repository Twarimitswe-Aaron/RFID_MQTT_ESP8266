const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import refactored modules
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutesModule = require('./routes/productRoutes');
const productRoutes = productRoutesModule.router;

// Import entities from backend/entities (same mongoose instance)
const { Card, Transaction, Product } = require('./entities');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST" ,"PUT","PATCH"]
  }
});

app.use(cors());
app.use(express.json());

// Mount auth routes
app.use('/', authRoutes);

// Mount product routes
app.use('/api', productRoutes);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const PORT = process.env.PORT1 || 8228;
const TEAM_ID = "1nt3rn4l_53rv3r_3rr0r";
const MQTT_BROKER = "mqtt://157.173.101.159:1883";
// const MQTT_BROKER = "mqtt://broker.hivemq.com:1883";
const MONGO_URI = process.env.MONGODB_URI;
const SECRET_KEY = process.env.JWT_SECRET || 'secret123';

// MongoDB Connection
connectDB();

// Passcode helper functions
async function hashPasscode(passcode) {
  return await bcrypt.hash(passcode, 10);
}

async function verifyPasscode(inputPasscode, hashedPasscode) {
  return await bcrypt.compare(inputPasscode, hashedPasscode);
}

// Topics
const TOPIC_STATUS = `rfid/${TEAM_ID}/card/status`;
const TOPIC_BALANCE = `rfid/${TEAM_ID}/card/balance`;
const TOPIC_TOPUP = `rfid/${TEAM_ID}/card/topup`;
const TOPIC_PAYMENT = `rfid/${TEAM_ID}/card/payment`;
const TOPIC_REMOVED = `rfid/${TEAM_ID}/card/removed`;

// Get dashboard stats
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's transactions
    const todaysTransactions = await Transaction.find({
      timestamp: { $gte: today, $lt: tomorrow }
    });

    // Calculate stats
    const topupsToday = todaysTransactions
      .filter(t => t.type === 'topup')
      .reduce((acc, t) => ({ total: acc.total + t.amount, count: acc.count + 1 }), { total: 0, count: 0 });

    const paymentsToday = todaysTransactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => ({ total: acc.total + t.amount, count: acc.count + 1 }), { total: 0, count: 0 });

    // Get active cards count (cards with balance > 0)
    const activeCards = await Card.countDocuments({ balance: { $gt: 0 } });

    // Get total balance across all cards
    const totalBalanceResult = await Card.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalBalance = totalBalanceResult.length > 0 ? totalBalanceResult[0].total : 0;

    res.json({
      topupsToday,
      paymentsToday,
      activeCards,
      totalBalance
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent transactions for dashboard
app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  mqttClient.subscribe(TOPIC_STATUS);
  mqttClient.subscribe(TOPIC_BALANCE);
  mqttClient.subscribe(TOPIC_PAYMENT);
  mqttClient.subscribe(TOPIC_REMOVED);
});

mqttClient.on('message',async (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  try {
    const payload = JSON.parse(message.toString());

    if (topic === TOPIC_STATUS) {
      // Check if card exists in DB
      const existingCard = await Card.findOne({ uid: payload.uid });
      if (existingCard) {
        // Emit with DB data
        io.emit('card-status', {
          uid: payload.uid,
          balance: existingCard.balance,
          holderName: existingCard.holderName,
          status: payload.status,
          present: payload.present,
          ts: payload.ts
        });
        console.log(`Emitted card-status for existing card: ${payload.uid}`);
      } else {
        // Emit with ESP data, no holderName
        io.emit('card-status', {
          ...payload,
          holderName: null // Indicate new card
        });
        console.log(`Emitted card-status for new card: ${payload.uid}`);
      }
    } else if (topic === TOPIC_BALANCE) {
      io.emit('card-balance', payload);
      console.log(`Emitted card-balance: ${JSON.stringify(payload)}`);
    } else if (topic === TOPIC_PAYMENT) {
      io.emit('payment-result', payload);
      console.log(`Emitted payment-result: ${JSON.stringify(payload)}`);
    } else if (topic === TOPIC_REMOVED) {
      io.emit('card-removed', payload);
      console.log(`Emitted card-removed: ${JSON.stringify(payload)}`);
    }
  } catch (err) {
    console.error('Failed to parse MQTT message:', err);
  }
});

// HTTP Endpoints
app.post('/topup', authenticate, async (req, res) => {
  const { uid, amount, holderName, passcode } = req.body;
  console.log(`Topup request: uid=${uid}, amount=${amount}, holderName=${holderName}`);

  if (!uid || amount === undefined) {
    console.log('Topup failed: UID and amount required');
    return res.status(400).json({ error: 'UID and amount are required' });
  }

  try {
    console.log('Finding card for uid:', uid);
    // Find or create card
    let card = await Card.findOne({ uid });
    const balanceBefore = card ? card.balance : 0;
    console.log('Card found:', card ? 'existing' : 'not found', 'balanceBefore:', balanceBefore);

    if (!card) {
      if (!holderName) {
        console.log('Topup failed: Holder name required for new cards');
        return res.status(400).json({ error: 'Holder name is required for new cards' });
      }
      
      card = new Card({ 
        uid, 
        holderName, 
        balance: amount, 
        lastTopup: amount,
        passcode: null,
        passcodeSet: false
      });
      console.log('Created new card without passcode');
    } else {
      console.log('Updating existing card balance');
      // Cumulative topup: add to existing balance
      card.balance += amount;
      card.lastTopup = amount;
      card.updatedAt = Date.now();
    }

    console.log('Saving card');
    await card.save();
    console.log('Card saved successfully');

    console.log('Creating transaction record');
    // Create transaction record
    const transaction = new Transaction({
      uid: card.uid,
      holderName: card.holderName,
      userId: req.user.username,
      type: 'topup',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: card.balance,
      description: `Top-up of $${amount.toFixed(2)}`
    });
    await transaction.save();
    console.log('Transaction saved successfully');

    console.log('Publishing to MQTT');
    // Publish to MQTT with updated balance
    const payload = JSON.stringify({ uid, amount: card.balance });
    mqttClient.publish(TOPIC_TOPUP, payload, (err) => {
      if (err) {
        console.error('Failed to publish topup:', err);
        return res.status(500).json({ error: 'Failed to publish topup command' });
      }
      console.log(`Published topup for ${uid} (${card.holderName}): ${card.balance}`);
    });

    // Emit balance update to frontend
    io.emit('card-balance', { uid: card.uid, balance: card.balance });
    console.log(`Emitted card-balance for ${card.uid}: ${card.balance}`);

    console.log('Topup successful, sending response');
    res.json({
      success: true,
      message: 'Topup successful',
      card: {
        uid: card.uid,
        holderName: card.holderName,
        balance: card.balance,
        lastTopup: card.lastTopup
      },
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        timestamp: transaction.timestamp
      }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Payment / Debit endpoint
app.post('/pay', authenticate, async (req, res) => {
  const { uid, productId, amount, description, passcode } = req.body;

  if (!uid || (!productId && amount === undefined)) {
    return res.status(400).json({ error: 'UID and product or amount are required' });
  }

  try {
    // Find card first to check passcode requirement
    const card = await Card.findOne({ uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found. Please top up first.' });
    }
    
    // Verify passcode if set
    if (card.passcodeSet) {
      if (!passcode) {
        return res.status(401).json({ 
          error: 'Passcode required for this card',
          passcodeRequired: true
        });
      }
      
      const isValid = await verifyPasscode(passcode, card.passcode);
      if (!isValid) {
        return res.status(401).json({ 
          error: 'Incorrect passcode',
        });
      }
    }
    
    let payAmount;
    let payDescription;
    if (productId) {
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      payAmount = product.price;
      payDescription = `Purchase: ${product.name}`;
    } else {
      payAmount = amount;
      payDescription = description || 'Custom payment';
    }
    
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Check sufficient balance
    if (card.balance < payAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        currentBalance: card.balance,
        required: payAmount,
        shortfall: payAmount - card.balance
      });
    }

    const balanceBefore = card.balance;

    // Deduct amount
    card.balance -= payAmount;
    card.updatedAt = Date.now();
    await card.save();

    // Create transaction record
    const transaction = new Transaction({
      uid: card.uid,
      holderName: card.holderName,
      userId: req.user.username,
      type: 'debit',
      amount: payAmount,
      balanceBefore: balanceBefore,
      balanceAfter: card.balance,
      description: payDescription
    });
    await transaction.save();

    // Publish to MQTT so ESP8266 updates
    const payload = JSON.stringify({
      uid,
      amount: card.balance,
      deducted: payAmount,
      description: payDescription,
      status: 'success'
    });
    mqttClient.publish(TOPIC_PAYMENT, payload, (err) => {
      if (err) {
        console.error('Failed to publish payment:', err);
      }
      console.log(`Published payment for ${uid} (${card.holderName}): -$${payAmount.toFixed(2)}, balance: $${card.balance.toFixed(2)}`);
    });

    // Emit real-time update via WebSocket
    io.emit('payment-success', {
      uid: card.uid,
      holderName: card.holderName,
      amount: payAmount,
      balanceBefore,
      balanceAfter: card.balance,
      description: payDescription,
      timestamp: transaction.timestamp
    });

    res.json({
      success: true,
      message: 'Payment successful',
      card: {
        uid: card.uid,
        holderName: card.holderName,
        balance: card.balance
      },
      transaction: {
        id: transaction._id,
        type: 'debit',
        amount: payAmount,
        balanceBefore,
        balanceAfter: card.balance,
        description: payDescription,
        timestamp: transaction.timestamp
      }
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Set passcode for a card
app.post('/card/:uid/set-passcode', async (req, res) => {
  const { passcode } = req.body;
  
  if (!passcode || !/^\d{6}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be exactly 6 digits' });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    if (card.passcodeSet) {
      return res.status(400).json({ error: 'Passcode already set. Use change-passcode endpoint to update.' });
    }
    
    card.passcode = await hashPasscode(passcode);
    card.passcodeSet = true;
    card.updatedAt = Date.now();
    await card.save();
    
    res.json({ 
      success: true, 
      message: 'Passcode set successfully',
      passcodeSet: true
    });
  } catch (err) {
    console.error('Set passcode error:', err);
    res.status(500).json({ error: 'Failed to set passcode' });
  }
});

// Change passcode (requires old passcode)
app.post('/card/:uid/change-passcode', async (req, res) => {
  const { oldPasscode, newPasscode } = req.body;
  
  if (!oldPasscode || !newPasscode) {
    return res.status(400).json({ error: 'Both old and new passcodes are required' });
  }
  
  if (!/^\d{6}$/.test(newPasscode)) {
    return res.status(400).json({ error: 'New passcode must be exactly 6 digits' });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    if (!card.passcodeSet) {
      return res.status(400).json({ error: 'No passcode set. Use set-passcode endpoint first.' });
    }
    
    const isValid = await verifyPasscode(oldPasscode, card.passcode);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect old passcode' });
    }
    
    card.passcode = await hashPasscode(newPasscode);
    card.updatedAt = Date.now();
    await card.save();
    
    res.json({ 
      success: true, 
      message: 'Passcode changed successfully'
    });
  } catch (err) {
    console.error('Change passcode error:', err);
    res.status(500).json({ error: 'Failed to change passcode' });
  }
});

// Verify passcode
app.post('/card/:uid/verify-passcode', async (req, res) => {
  const { passcode } = req.body;
  
  if (!passcode || !/^\d{6}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be exactly 6 digits', valid: false });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found', valid: false });
    }
    
    if (!card.passcodeSet) {
      return res.status(400).json({ error: 'No passcode set for this card', valid: false });
    }
    
    const isValid = await verifyPasscode(passcode, card.passcode);
    
    if (isValid) {
      res.json({ 
        success: true, 
        valid: true,
        message: 'Passcode verified'
      });
    } else {
      res.status(401).json({ 
        error: 'Incorrect passcode', 
        valid: false 
      });
    }
  } catch (err) {
    console.error('Verify passcode error:', err);
    res.status(500).json({ error: 'Failed to verify passcode', valid: false });
  }
});

// Get card details
app.get('/api/card/:uid', async (req, res) => {
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get all cards
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await Card.find().sort({ updatedAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get all users (id + username only, no passwords)
app.get('/api/users', authenticate, async (req, res) => {
  try {
    const { User } = require('./entities');
    const users = await User.find({}, { _id: 1, username: 1, role: 1 }).sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register a new card (assign holder name to a scanned UID — holderName must match a user)
app.post('/api/cards/register', async (req, res) => {
  const { uid, holderName } = req.body;
  if (!uid || !holderName) return res.status(400).json({ error: 'UID and holderName required' });
  try {
    const { User } = require('./entities');
    const userExists = await User.findOne({ username: holderName });
    if (!userExists) {
      return res.status(400).json({ error: `No user found with username "${holderName}". Card holder must be a registered user.` });
    }
    let card = await Card.findOne({ uid });
    if (card) {
      card.holderName = holderName;
      card.updatedAt = Date.now();
    } else {
      card = new Card({ uid, holderName, balance: 0 });
    }
    await card.save();
    res.json({ success: true, card });
  } catch (err) {
    console.error('Register card error:', err);
    res.status(500).json({ error: 'Failed to register card' });
  }
});

// Get transaction history for a specific card
app.get('/transactions/:uid', async (req, res) => {
  try {
    const transactions = await Transaction.find({ uid: req.params.uid })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 transactions
    res.json(transactions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get all transactions (optional - for admin view)
app.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(transactions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get user transactions (filtered by user)
app.get('/user/transactions', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user.username;
    }
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(transactions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Socket connectivity
io.on('connection', (socket) => {
  console.log('User connected to the dashboard');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from: http://10.12.72.106:${PORT}`);
});

