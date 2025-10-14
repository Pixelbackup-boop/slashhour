import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from '../../config/logger.config';

/**
 * Custom Logger Service for NestJS
 * Wraps Winston logger to provide structured logging
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor(context?: string) {
    this.logger = new Logger(context);
  }

  /**
   * Write a 'log' level log
   */
  log(message: string, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.info(message);
  }

  /**
   * Write an 'error' level log
   */
  error(message: string, trace?: string, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.error(message, trace);
  }

  /**
   * Write a 'warn' level log
   */
  warn(message: string, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.warn(message);
  }

  /**
   * Write a 'debug' level log
   */
  debug(message: string, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.debug(message);
  }

  /**
   * Write a 'verbose' level log (maps to debug)
   */
  verbose(message: string, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.debug(message);
  }

  /**
   * Log HTTP request
   */
  http(message: string, metadata?: any) {
    this.logger.http(message, metadata);
  }

  /**
   * Log with custom metadata
   */
  logWithMetadata(level: string, message: string, metadata: any, context?: string) {
    const logger = context ? new Logger(context) : this.logger;
    logger.log(level, message, metadata);
  }
}
