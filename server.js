const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database configuration
const { knex } = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration using environment-driven allowed origins
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
const allowedOrigins = allowedOriginsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and wildcard
    if (!origin || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
// Handle preflight requests globally with the same options
app.options('*', cors(corsOptions));

// Rate limiting disabled
// Global and auth-specific rate limiters have been removed to allow unrestricted access.

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}



// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Room Booking System API',
    version: '1.0.0',
    documentation: '/api'
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    // Close database connections
    await knex.destroy();
    console.log('Database connections closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  try {
    // Close database connections
    await knex.destroy();
    console.log('Database connections closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Room Booking System API is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing
module.exports = app;