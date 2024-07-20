// backend/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const mfaRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many MFA attempts from this IP, please try again after 15 minutes'
});


// Export combined middleware
module.exports = [mfaRateLimiter];
