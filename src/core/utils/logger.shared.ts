import * as Sentry from '@sentry/nextjs';

export const SENTRY_ENABLED =
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

export function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  if (level === 'debug' && process.env.NODE_ENV === 'production') {
    return false;
  }
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

export function sanitize(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/password[=:]\s*[^\s]+/gi, 'password=[REDACTED]')
    .replace(/(api[_-]?key|access[_-]?token|secret)[=:]\s*[^\s]+/gi, '$1=[REDACTED]');
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
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

export function formatError(error: unknown): string {
  if (error instanceof Error) return sanitize(error.message);
  if (typeof error === 'string') return sanitize(error);
  return 'Unknown error';
}

export function captureToSentry(
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
