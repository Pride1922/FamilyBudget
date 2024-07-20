const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const { infoLogger } = require('../config/logger');

// Middleware to log request details for the /send-email route
router.use('/send-email', (req, res, next) => {
  infoLogger.info('Received request to send registration email', { email: req.body.email });
  next(); // Proceed to the next middleware or route handler
});

// Route to send registration email
router.post('/send-email', registerController.sendRegistrationEmail);

module.exports = router;
