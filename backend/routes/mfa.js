const express = require('express');
const router = express.Router();
const { authenticateToken} = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { getUserById } = require('../utils/utils');
const { errorLogger, infoLogger } = require('../config/logger');
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
          errorLogger.error('Error storing MFA secret in database:', { error });
          return res.status(500).json({ message: 'Failed to store MFA secret', error: error.message });
        }

        // Generate QR Code URL for the user to scan
        qrcode.toDataURL(secret.otpauth_url, async (err, data_url) => {
          if (err) {
            errorLogger.error('Error generating QR code:', { error: err });
            return res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
          }

          // Return the QR code URL to the client
          res.status(200).json({ qrCodeUrl: data_url });
        });
      }
    );
  } catch (error) {
    errorLogger.error('Error setting up MFA:', { error });
    res.status(500).json({ message: 'Failed to set up MFA', error: error.message });
  }
});



// POST endpoint to verify MFA

router.post('/verify-mfa', authenticateToken, (req, res) => {
  const { userId, mfaToken } = req.body;
  // Example function to retrieve user from database
  getUserById(userId, (error, user) => {
    if (error) {
      errorLogger.error('Error retrieving user:', { error });
      return res.status(500).json({ message: 'Failed to verify MFA', error: error.message });
    }

    const { mfaSecret } = user; // Assuming 'mfaSecret' is the field name in your Users table

    // Decrypt the secret
    const encryptionKey = process.env.ENCRYPTION_KEY;
    let secret;
    try {
      secret = decrypt(mfaSecret, encryptionKey);
    } catch (err) {
      errorLogger.error('Error decrypting MFA secret:', { error: err });
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
          errorLogger.error('Error updating mfa_enabled field:', { error: updateError });
          return res.status(500).json({ message: 'Failed to update MFA status', error: updateError.message });
        }

        infoLogger.info(`MFA verification successful for user ID ${userId}`);
        res.status(200).send({ message: 'MFA verification successful', token, user });
      });
    } else {
      errorLogger.error('Invalid MFA token attempt:', { userId, mfaToken });
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
        errorLogger.error('Error disabling MFA:', { error });
        return res.status(500).json({ message: 'Error disabling MFA', error: error.message });
      }
    
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `User with ID ${userId.id} not found` });
      }
    
      infoLogger.info(`MFA disabled for user ID ${userId.id}`);
      res.status(200).json({ message: 'MFA disabled successfully' });
    });

  } catch (error) {
    // Log any caught exceptions
    errorLogger.error('Caught exception disabling MFA:', { error });
    res.status(500).json({ message: 'Failed to disable MFA', error: error.message });
  }
});


module.exports = router;
