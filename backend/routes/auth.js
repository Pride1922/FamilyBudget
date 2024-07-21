const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database'); // Database configuration
const { errorLogger } = require('../config/logger'); // Logger configuration
const { sendEmail } = require('../utils/emailService'); // Import sendEmail function

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (error, results) => {
      if (error) {
        errorLogger.error('Database error:', { error });
        return res.status(500).send({ message: 'Database error', error });
      }

      if (results.length === 0) {
        return res.status(400).send({ message: 'Invalid email or password' });
      }

      const user = results[0];

      if (!user.isActive) {
        return res.status(403).send({ message: 'User is disabled' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid email or password' });
      }

      const requiresMFA = user.mfa_enabled; // Check if MFA is enabled

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      res.status(200).send({
        message: 'Login successful',
        token,
        requiresMFA,
        userId: user.id,
        user: { id: user.id, email: user.email, role: user.role }
      });
    });
  } catch (error) {
    errorLogger.error('Login error:', { error });
    res.status(500).send({ message: 'Server error', error });
  }
});

// Endpoint to get email by registration token
router.get('/email-by-token', (req, res) => {
  const token = req.query.token;

  // Check if token is provided
  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  // Query to validate token and retrieve associated email
  db.query('SELECT email FROM RegistrationTokens WHERE token = ? AND expiresAt > NOW()', [token], (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Invalid or expired token' });
    }

    // Token is valid, return email
    const email = results[0].email;
    res.status(200).send({ email });
  });
});

// Function to generate the reset password link
const generateResetPasswordLink = (token) => {
  return `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
};

// Endpoint for password recovery
router.post('/recover-password', async (req, res) => {
  const { email } = req.body;
  try {
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (error, results) => {
      if (error) {
        errorLogger.error('Database error:', { error });
        return res.status(500).send({ message: 'Database error', error });
      }

      if (results.length === 0) {
        return res.status(404).send({ message: 'Email not found' });
      }

      const user = results[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Generate the reset password link
      const resetPasswordLink = generateResetPasswordLink(resetToken);

      db.query('UPDATE Users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', 
      [resetTokenHash, resetTokenExpires, email], async (error) => {
        if (error) {
          errorLogger.error('Database error:', { error });
          return res.status(500).send({ message: 'Database error', error });
        }

        // Create the email options
        const mailOptions = {
          to: email,
          from: process.env.SMTP_USER,
          subject: 'Budget: Password Reset Request',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                 Please click on the following link, or paste this into your browser to complete the process:\n\n
                 ${resetPasswordLink}\n\n
                 If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send the email
        try {
          await sendEmail(mailOptions);
          res.status(200).send({ message: 'Password recovery email sent' });
        } catch (emailError) {
          errorLogger.error('Error sending recovery email:', { error: emailError });
          res.status(500).send({ message: 'Error sending recovery email', error: emailError });
        }
      });
    });
  } catch (error) {
    errorLogger.error('Password recovery error:', { error });
    res.status(500).send({ message: 'Server error', error });
  }
});

module.exports = router;
