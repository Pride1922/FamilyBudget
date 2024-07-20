const { infoLogger } = require('../config/logger');

const requestLogger = (req, res, next) => {
  infoLogger.info(`${req.method} ${req.url}`);
  next();
};

module.exports = requestLogger;