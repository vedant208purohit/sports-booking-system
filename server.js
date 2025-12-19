const express = require('express');
const cors = require('cors');
require('dotenv').config();

const venuesRouter = require('./routes/venues');
const bookingsRouter = require('./routes/bookings');
const transactionsRouter = require('./routes/transactions');
const membersRouter = require('./routes/members');
const sportsRouter = require('./routes/sports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/venues', venuesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/members', membersRouter);
app.use('/api/sports', sportsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Booking API',
    version: '1.0.0',
    endpoints: {
      venues: '/api/venues',
      bookings: '/api/bookings',
      transactions: '/api/transactions',
      members: '/api/members',
      sports: '/api/sports',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;

