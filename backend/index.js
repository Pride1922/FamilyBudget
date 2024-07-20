const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // Import Morgan for request logging
const categoriesRouter = require('./routes/categories');
const subcategoriesRouter = require('./routes/subcategories');
const requestLogger = require('./middleware/requestLogger');
const mfaRateLimiter = require('./middleware/rateLimiter');
const { authenticateToken } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const registerRouter = require('./routes/register');
const usersRouter = require('./routes/users');
const mfaRoutes = require('./routes/mfa'); // Import MFA routes
const { infoLogger, errorLogger } = require('./config/logger'); // Assuming logger setup
const rateLimit = require('express-rate-limit');

require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET;

// Enable trust proxy to allow usage of X-Forwarded-For header
app.set('trust proxy', 'loopback');

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    // Use req.ip or req.connection.remoteAddress based on trust proxy setting
    return req.ip;
  },
});
app.use(limiter);

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Parse incoming JSON requests

// Session middleware for managing user sessions
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Request logging middleware using Morgan
app.use(morgan('combined', { stream: { write: message => infoLogger.info(message.trim()) } }));

// Custom request logger middleware
app.use(requestLogger);

// API Routes
app.use('/api/categories', categoriesRouter); // Categories API routes
app.use('/api/subcategories', subcategoriesRouter); // Subcategories API routes

// Authentication and Authorization Middleware
app.use('/api/auth', authRouter); // Authentication routes (login)
app.use('/api', registerRouter); // Registration route

// Middleware to rate limit MFA related routes
app.use('/api/mfa', mfaRateLimiter);
  
// User Management Routes
app.use('/api/users', authenticateToken, usersRouter);

// MFA related routes
app.use('/api/mfa', mfaRoutes);

// Error handling middleware (if required)
// app.use(errorHandler); // Define your error handler function if needed

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
