const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
require('winston-daily-rotate-file');

const logFormat = printf(({ timestamp, level, message, stack }) => {
  return stack ? `${timestamp} [${level}]: ${message}\nStack: ${stack}` : `${timestamp} [${level}]: ${message}`;
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

const infoLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = { errorLogger, infoLogger };
