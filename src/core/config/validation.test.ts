import { validateConfig, validateSiteMetadata } from './validation';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('validateConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns silently when required env vars are present and valid', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = 'https://shopify.example.com';
    process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN = 'token';
    process.env.SHOPIFY_CLIENT_ID = 'client-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'client-secret';
    process.env.SHOPIFY_ADMIN_URL = 'https://admin.example.com';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.UPLOADTHING_TOKEN = 'upload-token';
    process.env.UPLOADTHING_SECRET = 'upload-secret';

    expect(() => validateConfig()).not.toThrow();
  });

  it('throws an error when NEXT_PUBLIC_BASE_URL is invalid', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = 'https://shopify.example.com';
    process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN = 'token';
    process.env.SHOPIFY_CLIENT_ID = 'client-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'client-secret';
    process.env.SHOPIFY_ADMIN_URL = 'https://admin.example.com';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.UPLOADTHING_TOKEN = 'upload-token';
    process.env.UPLOADTHING_SECRET = 'upload-secret';

    expect(() => validateConfig()).toThrow(/NEXT_PUBLIC_BASE_URL must be a valid URL/);
  });

  it('throws an error when NEXT_PUBLIC_BASE_URL uses HTTP in production', () => {
    // @ts-expect-error - NODE_ENV is a read-only property
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://example.com';
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = 'https://shopify.example.com';
    process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN = 'token';
    process.env.SHOPIFY_CLIENT_ID = 'client-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'client-secret';
    process.env.SHOPIFY_ADMIN_URL = 'https://admin.example.com';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.UPLOADTHING_TOKEN = 'upload-token';
    process.env.UPLOADTHING_SECRET = 'upload-secret';
    process.env.ADMIN_SECRET = 'admin-secret';

    expect(() => validateConfig()).toThrow(/NEXT_PUBLIC_BASE_URL uses HTTP/);
  });

  it('allows HTTP URLs in non-production environments', () => {
    // @ts-expect-error - NODE_ENV is a read-only property
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = 'https://shopify.example.com';
    process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN = 'token';
    process.env.SHOPIFY_CLIENT_ID = 'client-id';
    process.env.SHOPIFY_CLIENT_SECRET = 'client-secret';
    process.env.SHOPIFY_ADMIN_URL = 'https://admin.example.com';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.UPLOADTHING_TOKEN = 'upload-token';
    process.env.UPLOADTHING_SECRET = 'upload-secret';

    expect(() => validateConfig()).not.toThrow();
  });
});

describe('validateSiteMetadata', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns warnings when optional site metadata is missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_NAME;
    delete process.env.NEXT_PUBLIC_SITE_EMAIL;

    const warnings = validateSiteMetadata();

    expect(warnings).toEqual([
      expect.stringContaining('NEXT_PUBLIC_SITE_NAME is not set'),
      expect.stringContaining('NEXT_PUBLIC_SITE_EMAIL is not set'),
    ]);
  });

  it('returns an empty array when optional site metadata is present', () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'My Site';
    process.env.NEXT_PUBLIC_SITE_EMAIL = 'test@example.com';

    const warnings = validateSiteMetadata();

    expect(warnings).toHaveLength(0);
  });
});
