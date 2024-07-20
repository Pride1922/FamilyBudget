const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
require('winston-daily-rotate-file'); // Import DailyRotateFile

const errorLogger = winston.createLogger({
  level: 'error',
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message, stack }) => `${timestamp} [${level}]: ${message} ${stack || ''}`)
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
