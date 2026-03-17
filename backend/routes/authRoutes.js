const express = require('express');
const UserService = require('../services/userService');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    await UserService.createUser(username, password, role || 'user');
    res.json({ message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for:', username);
  try {
    const user = await UserService.authenticateUser(username, password);
    const token = UserService.generateToken(user);
    console.log('Login success for:', username);
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.log('Login failed for:', username, 'error:', err.message);
    res.status(401).json({ error: 'Invalid credentials', err : err.message });
  }
});

module.exports = router;
