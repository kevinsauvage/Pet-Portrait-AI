/**
 * Validates base URL configuration.
 */
function validateBaseUrl(errors: string[], warnings: string[], isProduction: boolean): void {
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    errors.push(
      'NEXT_PUBLIC_BASE_URL is required. Set it in your .env.local file (e.g., NEXT_PUBLIC_BASE_URL=https://yourdomain.com)',
    );
    return;
  }

  try {
    const url = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    if (isProduction && url.protocol === 'http:') {
      warnings.push('NEXT_PUBLIC_BASE_URL uses HTTP. Use HTTPS in production for security.');
    }
  } catch {
    errors.push(
      `NEXT_PUBLIC_BASE_URL must be a valid URL (e.g., https://yourdomain.com). Current value: ${process.env.NEXT_PUBLIC_BASE_URL}`,
    );
  }
}

/**
 * Validates Shopify configuration.
 */
function validateShopifyConfig(errors: string[]): void {
  if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL is required. Set it to your Shopify Storefront API URL.',
    );
  }

  if (!process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN) {
    errors.push(
      'SHOPIFY_STORE_FRONT_ACCESS_TOKEN is required. Create a Storefront access token in Shopify and set it in your .env file.',
    );
  }

  if (!process.env.SHOPIFY_CLIENT_ID) {
    errors.push('SHOPIFY_CLIENT_ID is required. Set it to your Shopify custom app client ID.');
  }

  if (!process.env.SHOPIFY_CLIENT_SECRET) {
    errors.push(
      'SHOPIFY_CLIENT_SECRET is required. Set it to your Shopify custom app client secret.',
    );
  }

  if (!process.env.SHOPIFY_ADMIN_URL) {
    errors.push('SHOPIFY_ADMIN_URL is required. Set it to your Shopify Admin API URL.');
  }
}

/**
 * Validates third-party integrations.
 */
function validateThirdPartyIntegrations(errors: string[]): void {
  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required. Set it to your OpenAI API key.');
  }

  if (!process.env.UPLOADTHING_TOKEN) {
    errors.push(
      'UPLOADTHING_TOKEN is required when uploads are enabled. Set it to your UploadThing token.',
    );
  }

  if (!process.env.UPLOADTHING_SECRET) {
    errors.push(
      'UPLOADTHING_SECRET is required when uploads are enabled. Set it to your UploadThing secret.',
    );
  }
}

/**
 * Validates production-specific requirements.
 */
function validateProductionRequirements(errors: string[]): void {
  const hasAdminBasicAuth = process.env.ADMIN_BASIC_USER && process.env.ADMIN_BASIC_PASSWORD;
  const hasAdminBearerAuth = process.env.ADMIN_SECRET;

  if (!hasAdminBasicAuth && !hasAdminBearerAuth) {
    errors.push(
      'Admin authentication is required in production. Set either ADMIN_BASIC_USER + ADMIN_BASIC_PASSWORD, or ADMIN_SECRET.',
    );
  }
}

/**
 * Validates production recommendations (warnings only).
 */
function validateProductionRecommendations(warnings: string[]): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    warnings.push(
      'NEXT_PUBLIC_SENTRY_DSN is not set. Error monitoring is recommended for production. Set SENTRY_ORG and SENTRY_PROJECT as well.',
    );
  } else if (!process.env.SENTRY_ORG || !process.env.SENTRY_PROJECT) {
    warnings.push(
      'SENTRY_ORG and SENTRY_PROJECT should be set when using Sentry for better release tracking.',
    );
  }

  if (!process.env.REDIS_URL) {
    warnings.push(
      'REDIS_URL is not set. Rate limiting will use in-memory storage, which does not work across multiple server instances.',
    );
  }
}

import { logger } from '../utils/logger';

/**
 * Validates that required environment variables are set.
 * Called during app initialization to fail fast with clear error messages.
 */
export function validateConfig(): void {
  if (Object.keys(process.env).length === 0) {
    return;
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  validateBaseUrl(errors, warnings, isProduction);
  validateShopifyConfig(errors);
  validateThirdPartyIntegrations(errors);

  if (isProduction) {
    validateProductionRequirements(errors);
    validateProductionRecommendations(warnings);
  }

  if (warnings.length > 0) {
    logger.warn('Configuration warnings detected', {
      context: 'config-validation',
      metadata: { warnings },
    });
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  ✗ ${e}`).join('\n')}`,
    );
  }
}

/**
 * Validates optional site metadata values.
 * Returns warnings (does not throw) for missing optional values.
 */
export function validateSiteMetadata(): string[] {
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_SITE_NAME) {
    warnings.push(
      'NEXT_PUBLIC_SITE_NAME is not set. Using fallback value. Consider setting it for better SEO.',
    );
  }

  if (!process.env.NEXT_PUBLIC_SITE_EMAIL) {
    warnings.push('NEXT_PUBLIC_SITE_EMAIL is not set. Using fallback value.');
  }

  return warnings;
}

/**
 * Returns a summary of environment configuration status.
 * Useful for debugging and deployment verification.
 */
export function getConfigStatus(): {
  required: { [key: string]: boolean };
  recommended: { [key: string]: boolean };
  optional: { [key: string]: boolean };
} {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    required: {
      NEXT_PUBLIC_BASE_URL: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL: Boolean(process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL),
      SHOPIFY_STORE_FRONT_ACCESS_TOKEN: Boolean(process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN),
      SHOPIFY_CLIENT_ID: Boolean(process.env.SHOPIFY_CLIENT_ID),
      SHOPIFY_CLIENT_SECRET: Boolean(process.env.SHOPIFY_CLIENT_SECRET),
      SHOPIFY_ADMIN_URL: Boolean(process.env.SHOPIFY_ADMIN_URL),
      OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
      UPLOADTHING_TOKEN: Boolean(process.env.UPLOADTHING_TOKEN),
      UPLOADTHING_SECRET: Boolean(process.env.UPLOADTHING_SECRET),
      ...(isProduction && {
        ADMIN_AUTH: Boolean(
          (process.env.ADMIN_BASIC_USER && process.env.ADMIN_BASIC_PASSWORD) ||
          process.env.ADMIN_SECRET,
        ),
      }),
    },
    recommended: {
      NEXT_PUBLIC_SENTRY_DSN: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
      SENTRY_ORG: Boolean(process.env.SENTRY_ORG),
      SENTRY_PROJECT: Boolean(process.env.SENTRY_PROJECT),
      REDIS_URL: Boolean(process.env.REDIS_URL),
    },
    optional: {
      NEXT_PUBLIC_SITE_NAME: Boolean(process.env.NEXT_PUBLIC_SITE_NAME),
      NEXT_PUBLIC_SITE_EMAIL: Boolean(process.env.NEXT_PUBLIC_SITE_EMAIL),
      NEXT_PUBLIC_GTM_ID: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
      AI_API_SECRET: Boolean(process.env.AI_API_SECRET),
      UPLOADTHING_API_SECRET: Boolean(process.env.UPLOADTHING_API_SECRET),
    },
  };
}
