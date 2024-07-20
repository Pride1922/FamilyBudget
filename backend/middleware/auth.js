const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send({ message: 'Access token missing or invalid' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ message: 'Access token invalid' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
