import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Logger } from '@nestjs/common';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export const initSentry = () => {
  const logger = new Logger('SentryConfig');
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  // Only initialize if DSN is provided and not in development
  if (dsn && environment !== 'development') {
    Sentry.init({
      dsn,
      environment,

      // Performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in staging

      // Profiling
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      integrations: [
        nodeProfilingIntegration(),
      ],

      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // Remove sensitive request data
        if (event.request?.data) {
          const data = event.request.data;
          if (typeof data === 'object' && data !== null) {
            ['password', 'token', 'secret', 'apiKey', 'refreshToken'].forEach(key => {
              if (key in data) {
                data[key] = '[Filtered]';
              }
            });
          }
        }

        // Remove sensitive context data
        if (event.contexts?.user) {
          delete event.contexts.user.email;
          delete event.contexts.user.phone;
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        'Non-Error exception captured',
        'Network request failed',
        'ValidationError',
      ],
    });

    logger.log('Sentry initialized for error tracking');
  } else {
    logger.log('Sentry disabled (no DSN or development environment)');
  }
};

/**
 * Create a Sentry transaction for performance monitoring
 * Note: Transaction API has changed in newer Sentry versions
 * Use Sentry.startSpan() for newer implementations
 */
export const startTransaction = (name: string, op: string) => {
  const logger = new Logger('SentryConfig');
  // Sentry v8+ uses different transaction API
  // This is a placeholder for future implementation
  logger.debug(`Transaction: ${name} (${op})`);
  return null;
};

/**
 * Capture an exception with context
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // Don't include email for privacy (already filtered in beforeSend)
  });
};

/**
 * Clear user context
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

export default Sentry;
