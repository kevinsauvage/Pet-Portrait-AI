import * as Sentry from '@sentry/nextjs';

const SENTRY_ENABLED =
  typeof process !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

function sanitize(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/password[=:]\s*[^\s]+/gi, 'password=[REDACTED]')
    .replace(/(api[_-]?key|access[_-]?token|secret)[=:]\s*[^\s]+/gi, '$1=[REDACTED]');
}

function formatError(error: unknown): string {
  if (error instanceof Error) return sanitize(error.message);
  if (typeof error === 'string') return sanitize(error);
  return 'Unknown error';
}

function captureToSentry(error: unknown, context?: string, level: 'error' | 'warning' = 'error'): void {
  if (!SENTRY_ENABLED) return;
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: context ? { context } : undefined,
      level,
    });
  }
}

/**
 * Structured logger with levels and optional context.
 * Errors are sanitized and sent to Sentry when DSN is configured.
 */
export const logger = {
  debug: (msg: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console -- logger utility
      console.debug(msg, ...args);
    }
  },

  info: (msg: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console -- logger utility
    console.info(msg, ...args);
  },

  warn: (contextOrMsg: string, error?: unknown): void => {
    const [context, err] = error !== undefined ? [contextOrMsg, error] : [undefined, undefined];
    const msg = err !== undefined ? formatError(err) : contextOrMsg;
    const prefix = context ? `[${context}]` : '';
    console.warn(prefix ? `${prefix} ${msg}` : msg, ...(err !== undefined ? [err] : []));
    if (err !== undefined) captureToSentry(err, context, 'warning');
  },

  error: (contextOrMsg: string, error?: unknown): void => {
    const [context, err] = error !== undefined ? [contextOrMsg, error] : [undefined, undefined];
    const msg = err !== undefined ? formatError(err) : contextOrMsg;
    const prefix = context ? `[${context}]` : '';
    console.error(prefix ? `${prefix} ${msg}` : msg, ...(err !== undefined ? [err] : []));
    if (err !== undefined) captureToSentry(err, context, 'error');
  },
};
