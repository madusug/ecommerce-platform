const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // For parsing JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));

// Mock data
const products = [
  { id: 1, name: 'T-Shirt', price: 20 },
  { id: 2, name: 'Jeans', price: 40 },
  { id: 3, name: 'Sneakers', price: 60 },
];

// Existing route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Product listing
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Mock login (expandable to real auth)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'user' && password === 'pass') {
    res.json({ success: true, token: 'mock-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Order placement
app.post('/api/orders', (req, res) => {
  const { userId, productIds } = req.body;
  res.json({ success: true, orderId: Math.floor(Math.random() * 1000) });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;