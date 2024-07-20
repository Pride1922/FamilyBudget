const bcrypt = require("bcrypt");
const db = require("../config/database");
const { errorLogger, infoLogger } = require("../config/logger");

// Reusable function for executing database queries
const executeQuery = async (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Centralized response handling
const handleResponse = (res, error, successMessage, successStatusCode = 200) => {
  if (error) {
    errorLogger.error(error.message, { error });
    return res.status(500).send({ message: "Internal server error", error });
  }
  res.status(successStatusCode).send({ message: successMessage });
};

// Function to update a user
const updateUser = async (req, res) => {
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

    const result = await executeQuery(updateQuery, updateParams);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: `No user found with ID ${id}` });
    }
    infoLogger.info(`User with ID ${id} updated successfully`);
    res.status(200).send({ message: `User with ID ${id} updated successfully` });
  } catch (error) {
    errorLogger.error("Error updating user:", { error });
    res.status(500).send({ message: "Error updating user", error });
  }
};

// Function to fetch all users
const getAllUsers = async (req, res) => {
  try {
    const results = await executeQuery("SELECT * FROM Users", []);
    infoLogger.info("Users fetched successfully");
    res.status(200).send(results);
  } catch (error) {
    errorLogger.error("Database error:", { error });
    res.status(500).send({ message: "Database error", error });
  }
};

// Function to fetch user by ID
const getUserById = async (req, res) => {
  const userId = req.user.id;
  try {
    const results = await executeQuery(
      "SELECT id, username, email, role, isActive, createdat, mfa_enabled FROM Users WHERE id = ?",
      [userId]
    );
    if (results.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    infoLogger.info("User data fetched successfully", { userId });
    res.status(200).send(results[0]);
  } catch (error) {
    errorLogger.error("Database error:", { error });
    res.status(500).send({ message: "Database error", error });
  }
};

// Function to add a new user
const addUser = async (username, email, hashedPassword, callback) => {
  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    await executeQuery(
      "INSERT INTO Users (email, username, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 'user', 1, ?, ?)",
      [email, username, hashedPassword, createdAt, updatedAt]
    );
    infoLogger.info("User added successfully");
    callback(null, { status: 201, message: "User added successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      errorLogger.error("Duplicate entry error while adding user:", { error });
      return callback({
        status: 400,
        message: "Username or email already exists",
      });
    }
    errorLogger.error("Database error while adding user:", { error });
    return callback({ status: 500, message: "Database error", error });
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await executeQuery("DELETE FROM Users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: `No user found with ID ${id}` });
    }
    infoLogger.info(`User with ID ${id} deleted successfully`);
    res.status(200).send({ message: `User with ID ${id} deleted successfully` });
  } catch (error) {
    errorLogger.error("Database error:", { error });
    res.status(500).send({ message: "Database error", error });
  }
};

// Function to change user's password
const changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const results = await executeQuery("SELECT * FROM Users WHERE id = ?", [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: true, message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await executeQuery("UPDATE Users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    infoLogger.info(`Password updated for user ID ${userId}`);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    errorLogger.error("Server error:", { error });
    res.status(500).json({ message: "Server error", error });
  }
};

// Function to register a user
const registerUser = async (req, res) => {
  const { email, username, password, token } = req.body;
  console.log("Registration Request:", { email, username, password, token });

  if (!email || !username || !password || !token) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    const tokenResults = await executeQuery(
      "SELECT email FROM RegistrationTokens WHERE token = ? AND expiresAt > NOW()",
      [token]
    );

    if (tokenResults.length === 0) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    addUser(username, email, hashedPassword, async (addUserError, result) => {
      if (addUserError) {
        return res.status(addUserError.status).send({ message: addUserError.message, error: addUserError.error });
      }

      await executeQuery("DELETE FROM RegistrationTokens WHERE token = ?", [token]);

      infoLogger.info("User registered successfully", { email, username });
      res.status(201).send({ message: "Registration successful" });
    });
  } catch (error) {
    errorLogger.error("Database error:", { error });
    res.status(500).send({ message: "Database error", error });
  }
};

module.exports = {
  updateUser,
  getAllUsers,
  getUserById,
  addUser,
  deleteUser,
  changePassword,
  registerUser,
};
