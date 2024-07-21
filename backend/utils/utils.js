const db = require('../config/database'); // Adjust this import based on your database configuration

// Function to get user by ID from database
function getUserById(userId, callback) {
  const query = 'SELECT * FROM Users WHERE id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) {
      return callback(error);
    }
    if (results.length === 0) {
      return callback(new Error('User not found'));
    }
    const user = results[0]; // Assuming results from DB query match the expected user object
    callback(null, user);
  });
}

const generateResetPasswordLink = (token) => {
  return `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
};


module.exports = {
  getUserById,
  generateResetPasswordLink
};
