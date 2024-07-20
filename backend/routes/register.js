// backend/routes/register.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Assuming you have database configuration
const { errorLogger, infoLogger } = require('../config/logger'); // Assuming you have logger configuration

// Register endpoint
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();
    const updatedAt = new Date();

    db.query(
      'INSERT INTO Users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'user', createdAt, updatedAt],
      (error, results) => {
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            errorLogger.error('Duplicate entry error:', { error });
            return res.status(400).send({ message: 'Username or email already exists' });
          }
          errorLogger.error('Database error:', { error });
          return res.status(500).send({ message: 'Database error', error });
        }
        infoLogger.info('User registered successfully');
        res.status(201).send({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    errorLogger.error('Server error:', { error });
    res.status(500).send({ message: 'Server error', error });
  }
});

module.exports = router;
