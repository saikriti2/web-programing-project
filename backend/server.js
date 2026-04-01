const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected to:', process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });
