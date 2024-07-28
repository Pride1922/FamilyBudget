const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database');
const { errorLogger, infoLogger, authLogger } = require('../config/logger'); // Include authLogger

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (error, results) => {
      if (error) {
        errorLogger.error('Database query error during login:', {
          message: 'Error executing query to check user email',
          query: 'SELECT * FROM Users WHERE email = ?',
          params: [email],
          error: error.message,
          stack: error.stack
        });
        return res.status(500).send({ message: 'Database error', error });
      }

      if (results.length === 0) {
        authLogger.info(`Login attempt failed: Email not found - ${email}`);
        return res.status(400).send({ message: 'Invalid email or password' });
      }

      const user = results[0];

      if (!user.isActive) {
        authLogger.info(`Login attempt failed: User is disabled - ${email}`);
        return res.status(403).send({ message: 'User is disabled' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        authLogger.info(`Login attempt failed: Invalid password for email - ${email}`);
        return res.status(400).send({ message: 'Invalid email or password' });
      }

      const requiresMFA = user.mfa_enabled;

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      authLogger.info(`User logged in: ${email}`);

      res.status(200).send({
        message: 'Login successful',
        token,
        requiresMFA,
        userId: user.id,
        user: { id: user.id, email: user.email, role: user.role }
      });
    });
  } catch (error) {
    errorLogger.error('Unhandled error during login:', {
      message: 'An unexpected error occurred during login',
      error: error.message,
      stack: error.stack
    });
    res.status(500).send({ message: 'Server error', error });
  }
});

// Endpoint to get email by registration token
router.get('/email-by-token', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  db.query('SELECT email FROM RegistrationTokens WHERE token = ? AND expiresAt > NOW()', [token], (error, results) => {
    if (error) {
      errorLogger.error('Database query error during token validation:', {
        message: 'Error executing query to validate token',
        query: 'SELECT email FROM RegistrationTokens WHERE token = ? AND expiresAt > NOW()',
        params: [token],
        error: error.message,
        stack: error.stack
      });
      return res.status(500).send({ message: 'Database error', error });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Invalid or expired token' });
    }

    const email = results[0].email;
    authLogger.info(`Token validated successfully: ${token}`);
    res.status(200).send({ email });
  });
});

module.exports = router;
