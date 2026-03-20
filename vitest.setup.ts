import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Required env for modules that import `@/env` / `@/core/config` (T3 env validates when not in Vitest)
const requiredEnv = {
  NEXT_PUBLIC_BASE_URL: 'https://example.com',
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL: 'https://shopify.example.com',
  SHOPIFY_STORE_FRONT_ACCESS_TOKEN: 'test-token',
  SHOPIFY_CLIENT_ID: 'client-id',
  SHOPIFY_CLIENT_SECRET: 'client-secret',
  SHOPIFY_ADMIN_URL: 'https://admin.example.com',
  OPENAI_API_KEY: 'openai-key',
  UPLOADTHING_TOKEN: 'upload-token',
  UPLOADTHING_SECRET: 'upload-secret',
  AI_API_SECRET: 'test-ai-api-secret',
  UPLOADTHING_API_SECRET: 'test-uploadthing-api-secret',
  PRINTFUL_TOKEN: 'test-printful-token',
  PRINTFUL_API_SECRET: 'test-printful-api-secret',
};

Object.entries(requiredEnv).forEach(([key, value]) => {
  if (!process.env[key]) process.env[key] = value;
});
