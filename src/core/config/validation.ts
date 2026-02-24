/**
 * Validates that required environment variables are set.
 * Called during app initialization to fail fast with clear error messages.
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // If no environment variables are set, skip validation
  if (Object.keys(process.env).length === 0) {
    return;
  }

  // Required for base functionality
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    errors.push(
      'NEXT_PUBLIC_BASE_URL is required. Set it in your .env.local file (e.g., NEXT_PUBLIC_BASE_URL=https://yourdomain.com)',
    );
  }

  // Validate URL format if provided
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_BASE_URL);
    } catch {
      errors.push(
        `NEXT_PUBLIC_BASE_URL must be a valid URL (e.g., https://yourdomain.com). Current value: ${process.env.NEXT_PUBLIC_BASE_URL}`,
      );
    }
  }

  // Required Shopify configuration
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

  // Core third‑party integrations that are required for the main experience.
  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required. Set it to your OpenAI API key.');
  }

  // UploadThing base credentials are required when upload features are used.
  // Feature-specific secrets like UPLOADTHING_API_SECRET are validated where used.
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

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
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
