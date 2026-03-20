import 'server-only';

import {
  captureToSentry,
  formatError,
  type LogContext,
  sanitize,
  sanitizeObject,
  shouldLog,
} from './logger.shared';

import { randomUUID } from 'crypto';
import { Writable } from 'node:stream';
import pino from 'pino';

const envLevel = (process.env.LOG_LEVEL?.toLowerCase() || 'info') as
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

function resolvePinoLevel(): pino.Level {
  if (process.env.NODE_ENV === 'production') {
    if (envLevel === 'error') return 'error';
    if (envLevel === 'warn') return 'warn';
    return 'info';
  }
  if (envLevel === 'debug') return 'debug';
  if (envLevel === 'warn') return 'warn';
  if (envLevel === 'error') return 'error';
  return 'info';
}

/** Vitest-only sink so tests do not rely on `process.stdout.write` (Pino uses SonicBoom on fd 1). */
export const pinoTestSink: { lines: string[] } = { lines: [] };

const testWritable =
  process.env.VITEST === 'true'
    ? new Writable({
        write(chunk, _encoding, callback) {
          pinoTestSink.lines.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
          callback();
        },
      })
    : null;

const rootLog =
  process.env.VITEST === 'true' && testWritable
    ? pino({ level: resolvePinoLevel() }, testWritable)
    : pino({ level: resolvePinoLevel() }, pino.destination(1));

function bindingsFromOptions(context?: string, metadata?: Record<string, unknown>) {
  const base: Record<string, unknown> = {};
  if (context) base.context = context;
  if (metadata && Object.keys(metadata).length > 0) {
    Object.assign(base, sanitizeObject(metadata));
  }
  return base;
}

/**
 * Pino JSON logger for server-only code (API routes, services, infra).
 * Client components must use `@/core/utils/logger` (console).
 */
export const logger = {
  debug: (message: string, options?: LogContext): void => {
    if (!shouldLog('debug')) return;
    const { context, metadata } = options || {};
    rootLog.debug(bindingsFromOptions(context, metadata), sanitize(message));
  },

  info: (message: string, options?: LogContext): void => {
    if (!shouldLog('info')) return;
    const { context, metadata } = options || {};
    rootLog.info(bindingsFromOptions(context, metadata), sanitize(message));
  },

  warn: (message: string, options?: LogContext): void => {
    if (!shouldLog('warn')) return;
    const { context, error, metadata } = options || {};
    const msg = error !== undefined ? formatError(error) : message;
    const bindings = bindingsFromOptions(context, metadata);
    if (error instanceof Error) {
      bindings.err = error;
    } else if (error !== undefined) {
      bindings.errMessage = sanitize(String(error));
    }
    rootLog.warn(bindings, sanitize(msg));
    if (error !== undefined) {
      captureToSentry(error, context, 'warning', metadata);
    }
  },

  error: (message: string, options?: LogContext): void => {
    if (!shouldLog('error')) return;
    const { context, error, metadata } = options || {};
    const msg = error !== undefined ? formatError(error) : message;
    const bindings = bindingsFromOptions(context, metadata);
    if (error instanceof Error) {
      bindings.err = error;
    } else if (error !== undefined) {
      bindings.errMessage = sanitize(String(error));
    }
    rootLog.error(bindings, sanitize(msg));
    if (error !== undefined) {
      captureToSentry(error, context, 'error', metadata);
    }
  },
};

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

export type { LogContext };
