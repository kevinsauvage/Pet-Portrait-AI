/**
 * Optional site metadata checks (warnings only).
 * Required env validation runs via `@t3-oss/env-nextjs` in `src/env.ts` (imported from `next.config.ts`).
 * Production email + deployment recommendations: `src/core/config/runtime-warnings.ts` (instrumentation).
 */

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
 * Uses `process.env` so this stays safe if imported from modules that also run on the client.
 */
export function getConfigStatus(): {
  required: { [key: string]: boolean };
  recommended: { [key: string]: boolean };
  optional: { [key: string]: boolean };
} {
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
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      AI_API_SECRET: Boolean(process.env.AI_API_SECRET),
      UPLOADTHING_API_SECRET: Boolean(process.env.UPLOADTHING_API_SECRET),
      PRINTFUL_TOKEN: Boolean(process.env.PRINTFUL_TOKEN),
      PRINTFUL_API_SECRET: Boolean(process.env.PRINTFUL_API_SECRET),
    },
    recommended: {
      NEXT_PUBLIC_SENTRY_DSN: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
      SENTRY_ORG: Boolean(process.env.SENTRY_ORG),
      SENTRY_PROJECT: Boolean(process.env.SENTRY_PROJECT),
      REDIS_URL: Boolean(process.env.REDIS_URL),
      RESEND_FROM: Boolean(process.env.RESEND_FROM),
      CONTACT_EMAIL: Boolean(process.env.CONTACT_EMAIL),
    },
    optional: {
      NEXT_PUBLIC_SITE_NAME: Boolean(process.env.NEXT_PUBLIC_SITE_NAME),
      NEXT_PUBLIC_SITE_EMAIL: Boolean(process.env.NEXT_PUBLIC_SITE_EMAIL),
      NEXT_PUBLIC_GTM_ID: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
    },
  };
}
