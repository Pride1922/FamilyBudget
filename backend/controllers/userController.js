const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/database");
const { errorLogger, infoLogger } = require("../config/logger");
const { sendEmail } = require("../utils/emailService");
const { generateResetPasswordLink } = require('../utils/utils'); 

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
    errorLogger.error("Error response:", {
      message: error.message,
      stack: error.stack,
      query: error.query || "No query",
      params: error.params || "No params",
    });
    return res.status(500).send({ message: "Internal server error", error: error.message });
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

    // Check if the role has changed and notify the user if necessary
    if (req.user.id === id) {
      // Case: Updating own details
      const userResult = await executeQuery("SELECT role FROM Users WHERE id = ?", [id]);
      const currentRole = userResult[0]?.role;

      if (currentRole !== role) {
        return res.status(200).send({
          message: `Role updated. Please log in again.`,
          action: 'logout' // Indicate the need to log out
        });
      }
    }

    infoLogger.info("User updated successfully:", { id, updateParams });
    res.status(200).send({ message: `User with ID ${id} updated successfully` });
  } catch (error) {
    errorLogger.error("Error updating user:", {
      message: error.message,
      stack: error.stack,
      query: updateQuery || "No query",
      params: updateParams || "No params",
    });
    res.status(500).send({ message: "Error updating user", error: error.message });
  }
};


// Function to fetch all users
const getAllUsers = async (req, res) => {
  try {
    const results = await executeQuery("SELECT * FROM Users", []);
    infoLogger.info("All users fetched successfully");
    res.status(200).send(results);
  } catch (error) {
    errorLogger.error("Database error while fetching users:", {
      message: error.message,
      stack: error.stack,
      query: "SELECT * FROM Users",
      params: [],
    });
    res.status(500).send({ message: "Database error", error: error.message });
  }
};

// Function to fetch user by ID
const getUserById = async (req, res) => {
  const userId = req.user.id;
  try {
    const results = await executeQuery(
      "SELECT id, username, email, role, isActive, createdAt, mfa_enabled FROM Users WHERE id = ?",
      [userId]
    );
    if (results.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    infoLogger.info("User data fetched successfully:", { userId });
    res.status(200).send(results[0]);
  } catch (error) {
    errorLogger.error("Database error while fetching user by ID:", {
      message: error.message,
      stack: error.stack,
      query:
        "SELECT id, username, email, role, isActive, createdAt, mfa_enabled FROM Users WHERE id = ?",
      params: [userId],
    });
    res.status(500).send({ message: "Database error", error: error.message });
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
    infoLogger.info("User added successfully:", { email, username });
    callback(null, { status: 201, message: "User added successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      errorLogger.error("Duplicate entry error while adding user:", {
        message: error.message,
        stack: error.stack,
        query: "INSERT INTO Users ...",
        params: [email, username, hashedPassword, createdAt, updatedAt],
      });
      return callback({
        status: 400,
        message: "Username or email already exists",
      });
    }
    errorLogger.error("Database error while adding user:", {
      message: error.message,
      stack: error.stack,
      query: "INSERT INTO Users ...",
      params: [email, username, hashedPassword, createdAt, updatedAt],
    });
    return callback({
      status: 500,
      message: "Database error",
      error: error.message,
    });
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
    infoLogger.info("User deleted successfully:", { id });
    res.status(200).send({ message: `User with ID ${id} deleted successfully` });
  } catch (error) {
    errorLogger.error("Database error while deleting user:", {
      message: error.message,
      stack: error.stack,
      query: "DELETE FROM Users WHERE id = ?",
      params: [id],
    });
    res.status(500).send({ message: "Database error", error: error.message });
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

    infoLogger.info("Password updated successfully for user ID:", { userId });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    errorLogger.error("Server error while changing password:", {
      message: error.message,
      stack: error.stack,
      query: "UPDATE Users SET password = ? WHERE id = ?",
      params: [hashedPassword, userId],
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to register a user
const registerUser = async (req, res) => {
  const { email, username, password, token } = req.body;

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
        return res
          .status(addUserError.status)
          .send({ message: addUserError.message, error: addUserError.error });
      }

      await executeQuery("DELETE FROM RegistrationTokens WHERE token = ?", [token]);

      infoLogger.info("User registered successfully:", { email, username });
      res.status(201).send({ message: "Registration successful" });
    });
  } catch (error) {
    errorLogger.error("Database error while registering user:", {
      message: error.message,
      stack: error.stack,
      query: "SELECT email FROM RegistrationTokens WHERE token = ? AND expiresAt > NOW()",
      params: [token],
    });
    res.status(500).send({ message: "Database error", error: error.message });
  }
};

// Function to generate a password reset link
const recoverPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const results = await executeQuery("SELECT * FROM Users WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).send({ message: "Email not found" });
    }

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    const resetPasswordLink = generateResetPasswordLink(resetToken);

    await executeQuery(
      "UPDATE Users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?",
      [resetTokenHash, resetTokenExpires, email]
    );

    const mailOptions = {
      to: email,
      from: process.env.SMTP_USER,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetPasswordLink}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    try {
      await sendEmail(mailOptions);
      res.status(200).send({ message: "Password recovery email sent" });
    } catch (emailError) {
      errorLogger.error("Error sending recovery email:", {
        message: "Error occurred while sending recovery email",
        error: emailError.message,
        stack: emailError.stack,
      });
      res.status(500).send({ message: "Error sending recovery email", error: emailError.message });
    }
  } catch (error) {
    errorLogger.error("Unhandled error during password recovery:", {
      message: "An unexpected error occurred during password recovery",
      error: error.message,
      stack: error.stack,
    });
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

// Function to handle password reset
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const results = await executeQuery(
      "SELECT * FROM Users WHERE resetPasswordExpires > ?",
      [new Date()]
    );

    if (results.length === 0) {
      return res.status(400).send({ message: "Token is invalid or has expired" });
    }

    let user = null;
    for (let result of results) {
      const match = await bcrypt.compare(token, result.resetPasswordToken);
      if (match) {
        user = result;
        break;
      }
    }

    if (!user) {
      return res.status(400).send({ message: "Token is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await executeQuery(
      "UPDATE Users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?",
      [hashedPassword, user.email]
    );

    infoLogger.info("Password reset successfully for user:", { email: user.email });
    res.status(200).send({ message: "Password has been reset successfully" });
  } catch (error) {
    errorLogger.error("Server error during password reset:", {
      message: error.message,
      stack: error.stack,
      query: "UPDATE Users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?",
      params: [hashedPassword, user.email],
    });
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

// Function to verify reset token before password reset
const verifyResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    const results = await executeQuery(
      "SELECT * FROM Users WHERE resetPasswordExpires > ?",
      [new Date()]
    );

    if (results.length === 0) {
      return res.status(400).send({ message: "Token is invalid or has expired" });
    }

    let isValidToken = false;
    for (let user of results) {
      const match = await bcrypt.compare(token, user.resetPasswordToken);
      if (match) {
        isValidToken = true;
        break;
      }
    }

    if (!isValidToken) {
      return res.status(400).send({ message: "Token is invalid or has expired" });
    }

    res.status(200).send({ message: "Token is valid" });
  } catch (error) {
    errorLogger.error("Server error while verifying reset token:", {
      message: error.message,
      stack: error.stack,
      query: "SELECT * FROM Users WHERE resetPasswordExpires > ?",
      params: [new Date()],
    });
    res.status(500).send({ message: "Server error", error: error.message });
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
  recoverPassword,
  resetPassword,
  verifyResetToken
};
