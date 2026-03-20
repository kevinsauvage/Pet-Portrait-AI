import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const publicBaseUrlSchema = z
  .string()
  .url()
  .refine(
    (href) => {
      if (process.env.NODE_ENV !== 'production') return true;
      try {
        return new URL(href).protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'NEXT_PUBLIC_BASE_URL must use HTTPS in production' },
  );

export const env = createEnv({
  server: {
    SHOPIFY_STORE_FRONT_ACCESS_TOKEN: z.string().min(1),
    SHOPIFY_CLIENT_ID: z.string().min(1),
    SHOPIFY_CLIENT_SECRET: z.string().min(1),
    SHOPIFY_ADMIN_URL: z.string().url(),
    OPENAI_API_KEY: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
    UPLOADTHING_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().optional(),
    REDIS_URL: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    CONTACT_EMAIL: z.string().email().optional(),
    RESEND_FROM: z.string().optional(),
    AI_API_SECRET: z.string().min(1),
    UPLOADTHING_API_SECRET: z.string().min(1),
    SHOPIFY_SCOPE: z.string().optional(),
    /** Printful Catalog / mockup API (Bearer). */
    PRINTFUL_TOKEN: z.string().min(1),
    /** Protects POST /api/printful/preview. */
    PRINTFUL_API_SECRET: z.string().min(1),
    RATE_LIMIT_WINDOW_MS: z.string().optional(),
    RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    LOG_LEVEL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: publicBaseUrlSchema,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL: z.string().min(1),
    NEXT_PUBLIC_SITE_NAME: z.string().optional(),
    NEXT_PUBLIC_SITE_EMAIL: z.string().optional(),
    NEXT_PUBLIC_GTM_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SITE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_SITE_PHONE: z.string().optional(),
    NEXT_PUBLIC_SITE_LOGO: z.string().optional(),
    NEXT_PUBLIC_SITE_LOGO_DARK: z.string().optional(),
    NEXT_PUBLIC_SITE_OG_IMAGE: z.string().optional(),
    NEXT_PUBLIC_SITE_TWITTER_HANDLE: z.string().optional(),
    NEXT_PUBLIC_SITE_FACEBOOK_URL: z.string().optional(),
    NEXT_PUBLIC_SITE_INSTAGRAM_URL: z.string().optional(),
  },
  runtimeEnv: {
    SHOPIFY_STORE_FRONT_ACCESS_TOKEN: process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN,
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    SHOPIFY_ADMIN_URL: process.env.SHOPIFY_ADMIN_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    RESEND_FROM: process.env.RESEND_FROM,
    AI_API_SECRET: process.env.AI_API_SECRET,
    UPLOADTHING_API_SECRET: process.env.UPLOADTHING_API_SECRET,
    SHOPIFY_SCOPE: process.env.SHOPIFY_SCOPE,
    PRINTFUL_TOKEN: process.env.PRINTFUL_TOKEN,
    PRINTFUL_API_SECRET: process.env.PRINTFUL_API_SECRET,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_EMAIL: process.env.NEXT_PUBLIC_SITE_EMAIL,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_DOMAIN: process.env.NEXT_PUBLIC_SITE_DOMAIN,
    NEXT_PUBLIC_SITE_PHONE: process.env.NEXT_PUBLIC_SITE_PHONE,
    NEXT_PUBLIC_SITE_LOGO: process.env.NEXT_PUBLIC_SITE_LOGO,
    NEXT_PUBLIC_SITE_LOGO_DARK: process.env.NEXT_PUBLIC_SITE_LOGO_DARK,
    NEXT_PUBLIC_SITE_OG_IMAGE: process.env.NEXT_PUBLIC_SITE_OG_IMAGE,
    NEXT_PUBLIC_SITE_TWITTER_HANDLE: process.env.NEXT_PUBLIC_SITE_TWITTER_HANDLE,
    NEXT_PUBLIC_SITE_FACEBOOK_URL: process.env.NEXT_PUBLIC_SITE_FACEBOOK_URL,
    NEXT_PUBLIC_SITE_INSTAGRAM_URL: process.env.NEXT_PUBLIC_SITE_INSTAGRAM_URL,
  },
  skipValidation:
    Boolean(process.env.SKIP_ENV_VALIDATION) ||
    process.env.VITEST === 'true' ||
    process.env.NODE_ENV === 'test',
});
