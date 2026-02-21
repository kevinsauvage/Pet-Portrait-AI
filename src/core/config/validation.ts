
/**
 * Validates that required environment variables are set.
 * Called during app initialization to fail fast with clear error messages.
 */
export function validateConfig(): void {
  const errors: string[] = [];

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

