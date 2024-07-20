const crypto = require('crypto');
const db = require('../config/database'); // Adjust this import based on your database configuration

// Function to encrypt data
function encrypt(text, encryptionKey) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Return IV and encrypted text concatenated with ':'
}

// Function to decrypt data
function decrypt(text, encryptionKey) {
  const [iv, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
    encrypt,
    decrypt,
  };
  