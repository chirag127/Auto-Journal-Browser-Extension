// Auto-Journal - Backend Server
// Main entry point for the Express.js server

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const logRoutes = require('./routes/logRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const journalRoutes = require('./routes/journalRoutes');
const tagRoutes = require('./routes/tagRoutes');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json({ limit: '1mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging
app.use(limiter); // Rate limiting

// Routes
app.use('/api/log', logRoutes);
app.use('/api/summarize', summaryRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/tags', tagRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Auto-Journal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, we might want to exit the process and let a process manager restart it
  // process.exit(1);
});
