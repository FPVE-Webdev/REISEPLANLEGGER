import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * This configuration is applied to both client and server environments
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const SENTRY_ENABLED = SENTRY_DSN && process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'false';

// Define allowed URLs to prevent exposing sensitive information
const ALLOWED_URLS = [
  /https:\/\/tripplan\.tromso\.ai/,
  /http:\/\/localhost:3001/,
];

export function initSentry() {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    enabled: SENTRY_ENABLED,

    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Session Replay
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0.2,
    replaysOnErrorSampleRate: 1.0,

    // URL filtering - only capture events from allowed URLs
    allowUrls: ALLOWED_URLS,

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Random plugins/extensions
      'chrome-extension://',
      'moz-extension://',
    ],

    // Before sending to Sentry
    beforeSend(event, hint) {
      // Don't send if no DSN
      if (!SENTRY_DSN) {
        return null;
      }

      // Filter out development errors in production
      if (SENTRY_ENVIRONMENT === 'production') {
        // Check if error is from a development tool
        if (hint.originalException instanceof Error) {
          if (hint.originalException.message?.includes('ResizeObserver')) {
            return null;
          }
        }
      }

      return event;
    },

    // Attach stack trace to all messages
    attachStacktrace: true,

    // Maximum breadcrumbs to capture
    maxBreadcrumbs: 50,

    // Denylist for breadcrumb URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Ignore Sentry SDK itself
      /sentry/i,
    ],
  });
}

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>
) {
  if (!SENTRY_ENABLED) {
    console.error('Error:', error, context);
    return;
  }

  if (context) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
) {
  if (!SENTRY_ENABLED) {
    console.log(`[${level}] ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category: string = 'user-action'
) {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Set user context (anonymous to avoid storing PII)
 */
export function setUserContext(sessionId: string) {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setUser({
    id: sessionId,
    // DO NOT include email, username, or PII
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Set request context
 */
export function setRequestContext(
  endpoint: string,
  method: string,
  statusCode?: number
) {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setContext('http_request', {
    endpoint,
    method,
    status_code: statusCode,
  });
}

/**
 * Tag error by type
 */
export function tagError(type: 'api' | 'database' | 'external' | 'validation') {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setTag('error_type', type);
}

export default Sentry;
