const nodemailer = require('nodemailer');
const { errorLogger, infoLogger } = require('../config/logger'); // Adjust the path as needed

// Create a transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  // e.g., 'smtppro.zoho.eu'
  port: parseInt(process.env.SMTP_PORT, 10) || 587, // 587 for STARTTLS
  secure: false, // Set to true if using port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER, // e.g., 'admin@ameyerocha.com'
    pass: process.env.SMTP_PASS  // e.g., 'E4w31kz3Wdim'
  },
  logger: infoLogger, // Use Winston for logging (for debugging)
  debug: true // Show debug information in Winston logs
});

/**
 * Send an email with the provided options.
 * @param {Object} mailOptions - Email options (to, subject, text, html)
 * @returns {Promise} - Resolves with the email response, rejects with an error
 */
const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        errorLogger.error('Error sending email:', { message: error.message, code: error.code });
        if (error.code === 'EAUTH') {
          errorLogger.error('Authentication failed. Check your SMTP credentials.');
        } else if (error.code === 'EMESSAGE') {
          errorLogger.error('Message could not be sent. Check SMTP server settings.');
        } else if (error.code === 'ENOTFOUND') {
          errorLogger.error('SMTP server not found. Check your SMTP host and port.');
        } else if (error.code === 'ECONNREFUSED') {
          errorLogger.error('Connection refused. Check if your SMTP server is running.');
        }
        return reject(error);
      }
      infoLogger.info('Email sent successfully:', { response: info.response });
      resolve(info);
    });
  });
};

module.exports = {
  sendEmail
};
