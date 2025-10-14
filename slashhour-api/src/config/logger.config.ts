import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import * as path from 'path';

// Define custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about the colors
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;

    if (context) {
      msg += ` [${context}]`;
    }

    msg += `: ${message}`;

    // Add metadata if present
    const metaStr = JSON.stringify(metadata);
    if (metaStr !== '{}') {
      msg += ` ${metaStr}`;
    }

    return msg;
  }),
);

// Get log level from environment
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL || 'info';
  return level;
};

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Create transports array
const transports: winston.transport[] = [
  // Console transport for all environments
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  }),
];

// Add file transports only in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  );
}

// Create Winston logger
const logger = winston.createLogger({
  level: getLogLevel(),
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan (HTTP request logging)
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Logger helper functions
export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(message: string, metadata?: any) {
    return {
      message,
      context: this.context,
      ...metadata,
    };
  }

  error(message: string, trace?: string, metadata?: any) {
    logger.error(this.formatMessage(message, { trace, ...metadata }));
  }

  warn(message: string, metadata?: any) {
    logger.warn(this.formatMessage(message, metadata));
  }

  info(message: string, metadata?: any) {
    logger.info(this.formatMessage(message, metadata));
  }

  http(message: string, metadata?: any) {
    logger.http(this.formatMessage(message, metadata));
  }

  debug(message: string, metadata?: any) {
    logger.debug(this.formatMessage(message, metadata));
  }

  log(level: string, message: string, metadata?: any) {
    logger.log(level, this.formatMessage(message, metadata));
  }
}

// Default export
export default logger;
