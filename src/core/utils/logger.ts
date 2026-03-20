/**
 * Client-safe logger (console + Sentry). Use in `'use client'` components and browser-only code.
 *
 * For server routes, services, and infra, import `@/core/utils/logger.server` for **Pino** JSON logs.
 */
export { createPerformanceLogger, logger } from './logger.browser';
export type { LogContext } from './logger.shared';
