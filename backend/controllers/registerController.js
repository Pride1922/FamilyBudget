const crypto = require('crypto');
const db = require('../config/database');
const emailService = require('../utils/emailService');
const bcrypt = require('bcrypt');
const { errorLogger, infoLogger } = require('../config/logger');

// Function to send registration email
const sendRegistrationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    // Set token expiration (e.g., 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Save the token, email, and expiration date to the database
    db.query('INSERT INTO RegistrationTokens (email, token, createdAt, expiresAt) VALUES (?, ?, ?, ?)', [email, token, new Date(), expiresAt], (dbError) => {
      if (dbError) {
        errorLogger.error('Database error occurred while saving registration token:', { error: dbError });
        return res.status(500).json({ message: 'Database error', error: dbError });
      }

      // Prepare the email options
      const mailOptions = {
        from: process.env.SMTP_USER, // Sender address
        to: email, // Recipient address
        subject: 'Register Your Account',
        text: `Please register your account by clicking the following link: ${registrationLink}`
      };

      // Send the email
      emailService.sendEmail(mailOptions)
        .then((info) => {
          infoLogger.info('Registration email sent successfully:', { email, response: info.response });
          res.status(200).json({ message: 'Registration email sent successfully' });
        })
        .catch((emailError) => {
          errorLogger.error('Error sending registration email:', { error: emailError });
          res.status(500).json({ message: 'Error sending email', error: emailError });
        });
    });

  } catch (error) {
    errorLogger.error('Server error occurred during registration email process:', { error });
    res.status(500).json({ message: 'Server error', error });
  }
};

// Function to handle user registration
const registerUser = async (req, res) => {
  const { email, username, password, token } = req.body;

  try {
    // Verify the token and its expiration
    db.query('SELECT * FROM RegistrationTokens WHERE token = ? AND expiresAt > ?', [token, new Date()], (dbError, results) => {
      if (dbError) {
        errorLogger.error('Database error occurred while verifying registration token:', { error: dbError });
        return res.status(500).json({ message: 'Database error', error: dbError });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Check if the email or username already exists
      db.query('SELECT * FROM Users WHERE email = ? OR username = ?', [email, username], (userError, userResults) => {
        if (userError) {
          errorLogger.error('Database error occurred while checking if user exists:', { error: userError });
          return res.status(500).json({ message: 'Database error', error: userError });
        }

        if (userResults.length > 0) {
          return res.status(400).json({ message: 'Email or username already registered' });
        }

        // Token is valid, proceed with registration
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query('INSERT INTO Users (username, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, new Date(), new Date()], (insertError) => {
          if (insertError) {
            errorLogger.error('Database error occurred while registering user:', { error: insertError });
            return res.status(500).json({ message: 'Database error', error: insertError });
          }

          // Delete the token from the database
          db.query('DELETE FROM RegistrationTokens WHERE token = ?', [token], (deleteError) => {
            if (deleteError) {
              errorLogger.error('Database error occurred while deleting registration token:', { error: deleteError });
              return res.status(500).json({ message: 'Database error', error: deleteError });
            }

            infoLogger.info('User registered successfully:', { email });
            res.status(200).json({ message: 'User registered successfully' });
          });
        });
      });
    });

  } catch (error) {
    errorLogger.error('Server error occurred during user registration:', { error });
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  sendRegistrationEmail,
  registerUser
};
