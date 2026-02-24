/**
 * Storefront API token: always read from env.
 * This avoids hitting Shopify's 100-token limit for Storefront access tokens.
 */

let cachedStorefrontToken: string | null = null;

export async function getStorefrontAccessToken(): Promise<string> {
  if (cachedStorefrontToken) return cachedStorefrontToken;

  const token = process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      'Missing SHOPIFY_STORE_FRONT_ACCESS_TOKEN. Create a Storefront access token in Shopify and set SHOPIFY_STORE_FRONT_ACCESS_TOKEN in your .env file.',
    );
  }

  cachedStorefrontToken = token;
  return token;
}
