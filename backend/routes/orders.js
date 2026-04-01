const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all orders for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const newOrder = new Order({ userId: req.user.id, orderId, status: 'placed' });
    await newOrder.save();
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Raise a complaint
router.put('/:id/complaint', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'complaint', query }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve complaint (with feedback)
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { feedback } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'resolved', feedback }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
