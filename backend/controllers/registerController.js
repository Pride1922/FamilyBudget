const crypto = require('crypto');
const db = require('../config/database');
const emailService = require('../utils/emailService');
const bcrypt = require('bcrypt');
const { errorLogger, infoLogger } = require('../config/logger');

// Function to send registration email
const sendRegistrationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const token = crypto.randomBytes(20).toString('hex');
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    db.query('INSERT INTO RegistrationTokens (email, token, createdAt, expiresAt) VALUES (?, ?, ?, ?)', [email, token, new Date(), expiresAt], (dbError) => {
      if (dbError) {
        errorLogger.error('Database error while saving registration token:', {
          error: dbError.message,
          stack: dbError.stack,
          query: 'INSERT INTO RegistrationTokens (email, token, createdAt, expiresAt) VALUES (?, ?, ?, ?)',
          params: [email, token, new Date(), expiresAt]
        });
        return res.status(500).json({ message: 'Database error', error: dbError.message });
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Register Your Account',
        text: `Please register your account by clicking the following link: ${registrationLink}`
      };

      emailService.sendEmail(mailOptions)
        .then((info) => {
          infoLogger.info('Registration email sent successfully:', {
            email,
            response: info.response
          });
          res.status(200).json({ message: 'Registration email sent successfully' });
        })
        .catch((emailError) => {
          errorLogger.error('Error sending registration email:', {
            error: emailError.message,
            stack: emailError.stack,
            mailOptions
          });
          res.status(500).json({ message: 'Error sending email', error: emailError.message });
        });
    });

  } catch (error) {
    errorLogger.error('Server error during registration email process:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to handle user registration
const registerUser = async (req, res) => {
  const { email, username, password, token } = req.body;

  try {
    db.query('SELECT * FROM RegistrationTokens WHERE token = ? AND expiresAt > ?', [token, new Date()], (dbError, results) => {
      if (dbError) {
        errorLogger.error('Database error while verifying registration token:', {
          error: dbError.message,
          stack: dbError.stack,
          query: 'SELECT * FROM RegistrationTokens WHERE token = ? AND expiresAt > ?',
          params: [token, new Date()]
        });
        return res.status(500).json({ message: 'Database error', error: dbError.message });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      db.query('SELECT * FROM Users WHERE email = ? OR username = ?', [email, username], (userError, userResults) => {
        if (userError) {
          errorLogger.error('Database error while checking if user exists:', {
            error: userError.message,
            stack: userError.stack,
            query: 'SELECT * FROM Users WHERE email = ? OR username = ?',
            params: [email, username]
          });
          return res.status(500).json({ message: 'Database error', error: userError.message });
        }

        if (userResults.length > 0) {
          return res.status(400).json({ message: 'Email or username already registered' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query('INSERT INTO Users (username, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, new Date(), new Date()], (insertError) => {
          if (insertError) {
            errorLogger.error('Database error while registering user:', {
              error: insertError.message,
              stack: insertError.stack,
              query: 'INSERT INTO Users (username, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
              params: [username, email, hashedPassword, new Date(), new Date()]
            });
            return res.status(500).json({ message: 'Database error', error: insertError.message });
          }

          db.query('DELETE FROM RegistrationTokens WHERE token = ?', [token], (deleteError) => {
            if (deleteError) {
              errorLogger.error('Database error while deleting registration token:', {
                error: deleteError.message,
                stack: deleteError.stack,
                query: 'DELETE FROM RegistrationTokens WHERE token = ?',
                params: [token]
              });
              return res.status(500).json({ message: 'Database error', error: deleteError.message });
            }

            infoLogger.info('User registered successfully:', { email });
            res.status(200).json({ message: 'User registered successfully' });
          });
        });
      });
    });

  } catch (error) {
    errorLogger.error('Server error during user registration:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendRegistrationEmail,
  registerUser
};
