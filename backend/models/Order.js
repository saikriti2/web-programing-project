const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['placed', 'complaint', 'resolved'], default: 'placed' },
  query: { type: String, default: '' },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
