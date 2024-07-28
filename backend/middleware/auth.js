const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authLogger } = require('../config/logger'); // Import the authLogger

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    authLogger.warn('Authorization header missing'); // Log the missing header
    return res.status(401).send({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    authLogger.warn('Access token missing or invalid'); // Log the missing or invalid token
    return res.status(401).send({ message: 'Access token missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      authLogger.warn('Access token invalid'); // Log the invalid token
      return res.status(403).send({ message: 'Access token invalid' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      authLogger.warn(`User ${req.user ? req.user.username : 'unknown'} attempted to access forbidden route with insufficient permissions`); // Log forbidden access attempt
      return res.status(403).send({ message: 'Forbidden: Insufficient permissions' });
    }
    authLogger.info(`User ${req.user.username} authorized with role ${req.user.role}`); // Log authorized access
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
