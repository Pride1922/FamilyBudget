const db = require('../config/database');

function updateUser(params, callback) {
  const updateQuery = `
    UPDATE Users
    SET username = ?, email = ?, role = ?, isActive = ?, password = ?
    WHERE id = ?
  `;

  db.query(updateQuery, params, callback);
}

function getAllUsers(callback) {
  db.query('SELECT * FROM Users', callback);
}

function getUserById(userId, callback) {
  db.query('SELECT id, username, email, role, isActive, createdat, mfa_enabled FROM Users WHERE id = ?', [userId], callback);
}

function addUser(params, callback) {
  const insertQuery = `
    INSERT INTO Users (username, email, password, role, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, params, callback);
}

module.exports = {
  updateUser,
  getAllUsers,
  getUserById,
  addUser
};
