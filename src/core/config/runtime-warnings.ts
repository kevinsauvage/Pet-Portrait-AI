import 'server-only';

import { logger } from '@/core/utils/logger.server';
import { env } from '@/env';

import { validateSiteMetadata } from './validation';

export function assertProductionEmailEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!env.RESEND_API_KEY?.trim()) {
    throw new Error(
      'RESEND_API_KEY is required in production for sending emails. Get your API key from https://resend.com/api-keys',
    );
  }
}

export function logRuntimeConfigRecommendations(): void {
  const warnings: string[] = [...validateSiteMetadata()];

  if (env.NEXT_PUBLIC_SENTRY_DSN && (!env.SENTRY_ORG || !env.SENTRY_PROJECT)) {
    warnings.push(
      'SENTRY_ORG and SENTRY_PROJECT should be set when using Sentry for better release tracking.',
    );
  }

  if (!env.REDIS_URL) {
    warnings.push(
      'REDIS_URL is not set. Rate limiting will use in-memory storage, which does not work across multiple server instances. Set REDIS_URL in production when using multiple instances (e.g., Vercel, serverless).',
    );
  }

  if (warnings.length > 0) {
    logger.warn('Configuration warnings detected', {
      context: 'config-validation',
      metadata: { warnings },
    });
  }
}
