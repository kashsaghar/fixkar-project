const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Import routes
const serviceProviderRoutes = require('./routes/serviceProvider');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const complaintRoutes = require('./routes/complaints');
const categoryRoutes = require('./routes/categories');
const filtersRoutes = require('./routes/filters');

// Middleware
app.use(cors()); // This enables CORS for your frontend
app.use(express.json());

// Routes
app.use('/api/services', serviceProviderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/filters', filtersRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});