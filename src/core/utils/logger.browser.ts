import {
  captureToSentry,
  formatError,
  type LogContext,
  sanitizeObject,
  shouldLog,
} from './logger.shared';

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

/**
 * Console-based logger for client components and shared modules that must not import Node-only `pino`.
 * Server routes and services should use `@/core/utils/logger.server` (Pino JSON).
 */
export const logger = {
  debug: (message: string, options?: LogContext): void => {
    if (!shouldLog('debug')) return;

    const { context, metadata } = options || {};
    const formatted = formatLogMessage('debug', message, context, metadata);
    // eslint-disable-next-line no-console -- client logger
    console.debug(formatted);
  },

  info: (message: string, options?: LogContext): void => {
    if (!shouldLog('info')) return;

    const { context, metadata } = options || {};
    const formatted = formatLogMessage('info', message, context, metadata);
    // eslint-disable-next-line no-console -- client logger
    console.info(formatted);
  },

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

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createPerformanceLogger(context: string, thresholdMs = 1000) {
  const startTime = Date.now();
  const requestId = createRequestId();

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

export type { LogContext };
