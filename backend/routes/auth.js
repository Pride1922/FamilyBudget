// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Assuming you have database configuration
const { errorLogger } = require('../config/logger'); // Assuming you have logger configuration

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    db.query('SELECT * FROM Users WHERE username = ?', [username], async (error, results) => {
      if (error) {
        errorLogger.error('Database error:', { error });
        return res.status(500).send({ message: 'Database error', error });
      }

      if (results.length === 0) {
        return res.status(400).send({ message: 'Invalid username or password' });
      }

      const user = results[0];

      if (!user.isActive) {
        return res.status(403).send({ message: 'User is disabled' });
      }


      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid username or password' });
      }

      const requiresMFA = user.mfa_enabled; // Check if MFA is enabled

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      res.status(200).send({
        message: 'Login successful',
        token,
        requiresMFA,
        userId: user.id,
        user: { id: user.id, username: user.username, role: user.role }
      });
    });
  } catch (error) {
    errorLogger.error('Login error:', { error });
    res.status(500).send({ message: 'Server error', error });
  }
});

module.exports = router;
