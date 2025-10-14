import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN, APP_VERSION } from '../utils/constants';

/**
 * Initialize Sentry error tracking
 * Only tracks errors in production builds to avoid dev noise
 */
export const initSentry = () => {
  if (!__DEV__ && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Enable tracing
      tracesSampleRate: 1.0,

      // Set app version for release tracking
      release: APP_VERSION,

      // Environment
      environment: __DEV__ ? 'development' : 'production',

      // Enable auto session tracking
      enableAutoSessionTracking: true,

      // Session timeout in milliseconds
      sessionTrackingIntervalMillis: 30000,

      // Attach stack trace to all messages
      attachStacktrace: true,

      // Before send hook - filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from events
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }

        // Remove passwords from form data
        if (event.request?.data) {
          const data = event.request.data;
          if (typeof data === 'object' && data !== null) {
            const dataObj = data as Record<string, any>;
            ['password', 'token', 'secret'].forEach(key => {
              if (key in dataObj) {
                dataObj[key] = '[Filtered]';
              }
            });
          }
        }

        return event;
      },
    });

    console.log('✅ Sentry initialized');
  } else {
    console.log('ℹ️ Sentry disabled in development mode');
  }
};

/**
 * Log a custom error to Sentry
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  if (!__DEV__) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
};

/**
 * Log a message to Sentry
 */
export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!__DEV__) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
};

/**
 * Set user context for Sentry
 */
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  if (!__DEV__) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (!__DEV__) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (!__DEV__) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
};

export default Sentry;
