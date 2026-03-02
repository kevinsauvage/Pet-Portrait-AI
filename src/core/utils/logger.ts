import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';

const SENTRY_ENABLED =
  typeof process !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

const LOG_LEVEL = (process.env.LOG_LEVEL?.toLowerCase() || 'info') as
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  // Debug logs are always disabled in production
  if (level === 'debug' && process.env.NODE_ENV === 'production') {
    return false;
  }
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

function sanitize(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/password[=:]\s*[^\s]+/gi, 'password=[REDACTED]')
    .replace(/(api[_-]?key|access[_-]?token|secret)[=:]\s*[^\s]+/gi, '$1=[REDACTED]');
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitize(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatError(error: unknown): string {
  if (error instanceof Error) return sanitize(error.message);
  if (typeof error === 'string') return sanitize(error);
  return 'Unknown error';
}

function formatLogMessage(
  level: string,
  message: string,
  context?: string,
  metadata?: Record<string, unknown>,
): string {
  const parts: string[] = [];

  if (context) {
    parts.push(`[${context}]`);
  }

  parts.push(message);

  if (metadata && Object.keys(metadata).length > 0) {
    const sanitizedMetadata = sanitizeObject(metadata);
    parts.push(JSON.stringify(sanitizedMetadata));
  }

  return parts.join(' ');
}

function captureToSentry(
  error: unknown,
  context?: string,
  level: 'error' | 'warning' = 'error',
  metadata?: Record<string, unknown>,
): void {
  if (!SENTRY_ENABLED) return;
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        ...(context && { context }),
      },
      level,
      extra: metadata ? sanitizeObject(metadata) : undefined,
    });
  }
}

export type LogContext = {
  context?: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
};

/**
 * Structured logger with levels, context, and request ID tracking.
 * Errors are sanitized and sent to Sentry when DSN is configured.
 *
 * @example
 * ```ts
 * logger.info('Operation started', { context: 'ai-generation', metadata: { styleId: 'pixar' } });
 * logger.error('Operation failed', { context: 'ai-generation', error, metadata: { photoUrl: '...' } });
 * ```
 */
export const logger = {
  /**
   * Debug logs - only in development, disabled in production
   */
  debug: (message: string, options?: LogContext): void => {
    if (!shouldLog('debug')) return;

    const { context, metadata } = options || {};
    const formatted = formatLogMessage('debug', message, context, metadata);
    // eslint-disable-next-line no-console -- logger utility
    console.debug(formatted);
  },

  /**
   * Info logs - general information
   */
  info: (message: string, options?: LogContext): void => {
    if (!shouldLog('info')) return;

    const { context, metadata } = options || {};
    const formatted = formatLogMessage('info', message, context, metadata);
    // eslint-disable-next-line no-console -- logger utility
    console.info(formatted);
  },

  /**
   * Warning logs - warnings that don't stop execution
   */
  warn: (message: string, options?: LogContext): void => {
    if (!shouldLog('warn')) return;

    const { context, error, metadata } = options || {};
    const msg = error !== undefined ? formatError(error) : message;
    const formatted = formatLogMessage('warn', msg, context, metadata);

    console.warn(formatted, ...(error !== undefined ? [error] : []));

    if (error !== undefined) {
      captureToSentry(error, context, 'warning', metadata);
    }
  },

  /**
   * Error logs - errors that should be investigated
   */
  error: (message: string, options?: LogContext): void => {
    if (!shouldLog('error')) return;

    const { context, error, metadata } = options || {};
    const msg = error !== undefined ? formatError(error) : message;
    const formatted = formatLogMessage('error', msg, context, metadata);

    console.error(formatted, ...(error !== undefined ? [error] : []));

    if (error !== undefined) {
      captureToSentry(error, context, 'error', metadata);
    }
  },
};

/**
 * Performance logger for tracking slow operations
 *
 * @example
 * ```ts
 * const perf = logger.performance('ai-generation');
 * // ... operation ...
 * perf.end({ styleId: 'pixar' }); // Logs if operation took > threshold
 * ```
 */
export function createPerformanceLogger(context: string, thresholdMs = 1000) {
  const startTime = Date.now();
  const requestId = randomUUID();

  return {
    end: (metadata?: Record<string, unknown>): number => {
      const duration = Date.now() - startTime;
      if (duration > thresholdMs) {
        logger.warn('Slow operation detected', {
          context,
          metadata: {
            ...metadata,
            durationMs: duration,
            thresholdMs,
          },
        });
      } else if (shouldLog('debug')) {
        logger.debug('Operation completed', {
          context,
          metadata: {
            ...metadata,
            durationMs: duration,
          },
        });
      }
      return duration;
    },
    getDuration: (): number => Date.now() - startTime,
    requestId,
  };
}
