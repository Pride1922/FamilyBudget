const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { getUserById } = require('../utils/utils');
const { errorLogger, infoLogger, authLogger } = require('../config/logger'); // Include authLogger
const db = require('../config/database');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

// Endpoint to initiate MFA setup
router.post('/setup-mfa', authenticateToken, async (req, res) => {
  try {
    // Generate a secret key for the user
    const secret = speakeasy.generateSecret({
      length: 20,
      name: 'Family Budget',
      issuer: 'Family Budget'
    });

    // Encrypt the secret before storing it in the database
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedSecret = encrypt(secret.base32, encryptionKey);

    // Store the encrypted secret in the database
    db.query(
      'UPDATE Users SET mfaSecret = ? WHERE id = ?',
      [encryptedSecret, req.user.id],
      (error, result) => {
        if (error) {
          errorLogger.error('Database error storing MFA secret:', {
            message: 'Error executing query to update MFA secret',
            query: 'UPDATE Users SET mfaSecret = ? WHERE id = ?',
            params: [encryptedSecret, req.user.id],
            error: error.message,
            stack: error.stack
          });
          return res.status(500).json({ message: 'Failed to store MFA secret', error: error.message });
        }

        // Generate QR Code URL for the user to scan
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
          if (err) {
            errorLogger.error('Error generating QR code:', {
              message: 'Error generating QR code for MFA setup',
              error: err.message,
              stack: err.stack
            });
            return res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
          }

          authLogger.info(`MFA setup initiated for user ID ${req.user.id}`);
          // Return the QR code URL to the client
          res.status(200).json({ qrCodeUrl: data_url });
        });
      }
    );
  } catch (error) {
    errorLogger.error('Error during MFA setup:', {
      message: 'Error occurred while setting up MFA',
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to set up MFA', error: error.message });
  }
});

// POST endpoint to verify MFA
router.post('/verify-mfa', authenticateToken, (req, res) => {
  const { userId, mfaToken } = req.body;

  // Retrieve user details from the database
  getUserById(userId, (error, user) => {
    if (error) {
      errorLogger.error('Error retrieving user for MFA verification:', {
        message: 'Error fetching user details for MFA verification',
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Failed to verify MFA', error: error.message });
    }

    const { mfaSecret } = user; // Assuming 'mfaSecret' is the field name in your Users table

    // Decrypt the secret
    const encryptionKey = process.env.ENCRYPTION_KEY;
    let secret;
    try {
      secret = decrypt(mfaSecret, encryptionKey);
    } catch (err) {
      errorLogger.error('Error decrypting MFA secret:', {
        message: 'Error decrypting the MFA secret for user',
        error: err.message,
        stack: err.stack
      });
      return res.status(500).json({ message: 'Failed to decrypt MFA secret', error: err.message });
    }

    // Verify the MFA token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: mfaToken,
      window: 1
    });

    if (verified) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      // Update the mfa_enabled field
      db.query('UPDATE Users SET mfa_enabled = ? WHERE id = ?', [true, user.id], (updateError) => {
        if (updateError) {
          errorLogger.error('Error updating mfa_enabled field:', {
            message: 'Error updating MFA status in database',
            query: 'UPDATE Users SET mfa_enabled = ? WHERE id = ?',
            params: [true, user.id],
            error: updateError.message,
            stack: updateError.stack
          });
          return res.status(500).json({ message: 'Failed to update MFA status', error: updateError.message });
        }

        authLogger.info(`MFA verification successful for user ID ${userId}`);
        res.status(200).send({ message: 'MFA verification successful', token, user });
      });
    } else {
      authLogger.error('Invalid MFA token attempt:', {
        userId,
        mfaToken,
        message: 'MFA token verification failed'
      });
      res.status(401).send({ message: 'Invalid MFA token' });
    }
  });
});

// Endpoint to disable MFA for a user
router.post('/disable-mfa', authenticateToken, async (req, res) => {
  const { userId } = req.body;

  try {
    // Clear the user's MFA secret from the database
    db.query('UPDATE Users SET mfa_enabled = ?, mfaSecret = NULL WHERE id = ?', [false, userId.id], (error, result) => {
      if (error) {
        errorLogger.error('Error disabling MFA in database:', {
          message: 'Error executing query to disable MFA',
          query: 'UPDATE Users SET mfa_enabled = ?, mfaSecret = NULL WHERE id = ?',
          params: [false, userId.id],
          error: error.message,
          stack: error.stack
        });
        return res.status(500).json({ message: 'Error disabling MFA', error: error.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      authLogger.info(`MFA disabled for user ID ${userId}`);
      res.status(200).json({ message: 'MFA disabled successfully' });
    });
  } catch (error) {
    errorLogger.error('Caught exception while disabling MFA:', {
      message: 'Exception occurred during MFA disable operation',
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to disable MFA', error: error.message });
  }
});

module.exports = router;
