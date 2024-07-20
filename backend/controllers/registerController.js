const crypto = require('crypto');
const db = require('../config/database');
const emailService = require('../utils/emailService');
const { errorLogger, infoLogger } = require('../config/logger');

// Function to send registration email
const sendRegistrationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    // Save the token and email to the database
    db.query('INSERT INTO RegistrationTokens (email, token, createdAt) VALUES (?, ?, ?)', [email, token, new Date()], (dbError) => {
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

module.exports = {
  sendRegistrationEmail
};
