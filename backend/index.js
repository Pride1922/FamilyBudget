const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const publicRouter = require('./routes/public');
const categoriesRouter = require('./routes/categories');
const subcategoriesRouter = require('./routes/subcategories');
const requestLogger = require('./middleware/requestLogger');
const mfaRateLimiter = require('./middleware/rateLimiter');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const registerRouter = require('./routes/register');
const usersRouter = require('./routes/users');
const mfaRoutes = require('./routes/mfa');
const { infoLogger, errorLogger } = require('./config/logger');
const merchantRoutes = require('./routes/merchantRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const pendingMovementsRoutes = require('./routes/pendingMovementsRoutes');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET;

// Enable trust proxy
app.set('trust proxy', 'loopback');

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => req.ip,
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // true in production
}));
app.use(morgan('combined', { stream: { write: message => infoLogger.info(message.trim()) } }));
app.use(requestLogger);

// Apply routes
app.use('/api', publicRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/register', registerRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/mfa', mfaRateLimiter);
app.use('/api/mfa', mfaRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/bankaccounts', bankAccountRoutes);
app.use('/api/pending-movements', pendingMovementsRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  errorLogger.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
