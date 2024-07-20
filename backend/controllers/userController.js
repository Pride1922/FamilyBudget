const bcrypt = require('bcrypt');
const db = require('../config/database');
const { errorLogger, infoLogger } = require('../config/logger');

// Function to update a user
const updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, role, isActive, password } = req.body;

  try {
    let updateQuery, updateParams;

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updateQuery = `
        UPDATE Users
        SET username = ?, email = ?, role = ?, isActive = ?, password = ?
        WHERE id = ?
      `;
      updateParams = [username, email, role, isActive, hashedPassword, id];
    } else {
      updateQuery = `
        UPDATE Users
        SET username = ?, email = ?, role = ?, isActive = ?
        WHERE id = ?
      `;
      updateParams = [username, email, role, isActive, id];
    }

    // Execute the query with updated parameters
    db.query(updateQuery, updateParams, (error, result) => {
      if (error) {
        errorLogger.error('Database error:', { error });
        return res.status(500).send({ message: 'Database error', error });
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: `No user found with ID ${id}` });
      }
      infoLogger.info(`User with ID ${id} updated successfully`);
      res.status(200).send({ message: `User with ID ${id} updated successfully` });
    });

  } catch (error) {
    errorLogger.error('Error updating user:', { error });
    res.status(500).send({ message: 'Error updating user', error });
  }
};

// Function to fetch all users
const getAllUsers = (req, res) => {
  db.query('SELECT * FROM Users', (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    infoLogger.info('Users fetched successfully');
    res.status(200).send(results);
  });
};

// Function to fetch user by ID
const getUserById = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, username, email, role, isActive, createdat, mfa_enabled FROM Users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    infoLogger.info('User data fetched successfully', { userId });
    res.status(200).send(results[0]);
  });
};

// Function to add a new user
const addUser = (req, res) => {
  const { username, email, password, role, isActive } = req.body;
  const createdAt = new Date();
  const updatedAt = new Date();

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO Users (username, email, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, email, hashedPassword, role, isActive, createdAt, updatedAt],
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          errorLogger.error('Duplicate entry error:', { error });
          return res.status(400).send({ message: 'Username or email already exists' });
        }
        errorLogger.error('Database error:', { error });
        return res.status(500).send({ message: 'Database error', error });
      }
      infoLogger.info('User added successfully');
      res.status(201).send({ message: 'User added successfully' });
    }
  );
};

// Function to delete a user
const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Users WHERE id = ?', [id], (error, result) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: `No user found with ID ${id}` });
    }
    infoLogger.info(`User with ID ${id} deleted successfully`);
    res.status(200).send({ message: `User with ID ${id} deleted successfully` });
  });
};

// Function to change user's password
const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    try {
      // Query to get the user's current password hash
      db.query('SELECT * FROM Users WHERE id = ?', [userId], async (error, results) => {
        if (error) {
          errorLogger.error('Database error:', { error });
          return res.status(500).json({ message: 'Database error', error });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const user = results[0];
  
        // Compare old password with the stored hashed password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: true, message: 'Old password is incorrect' });
        }
  
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        // Update the user's password in the database
        db.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, userId], (updateError, updateResult) => {
          if (updateError) {
            errorLogger.error('Error updating password:', { error: updateError });
            return res.status(500).json({ message: 'Error updating password', error: updateError });
          }
  
          infoLogger.info(`Password updated for user ID ${userId}`);
          res.status(200).json({ message: 'Password changed successfully' });
        });
  
      });
  
    } catch (error) {
      errorLogger.error('Server error:', { error });
      res.status(500).json({ message: 'Server error', error });
    }
  };

module.exports = {
  updateUser,
  getAllUsers,
  getUserById,
  addUser,
  deleteUser,
  changePassword
};
