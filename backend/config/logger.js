const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
require('winston-daily-rotate-file');

const logFormat = printf(({ timestamp, level, message, stack }) => {
  return stack ? `${timestamp} [${level}]: ${message}\nStack: ${stack}` : `${timestamp} [${level}]: ${message}`;
});

const customTimestampFormat = winston.format((info, opts) => {
  info.timestamp = new Date().toLocaleString('nl-BE', { timeZone: 'Europe/Brussels' });
  return info;
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: combine(
    customTimestampFormat(),
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
    customTimestampFormat(),
    logFormat
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

const authLogger = winston.createLogger({
  level: 'info',
  format: combine(
    customTimestampFormat(),
    logFormat
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/auth-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = { errorLogger, infoLogger, authLogger };
