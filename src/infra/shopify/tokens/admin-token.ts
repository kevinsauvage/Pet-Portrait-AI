/**
 * Shopify Admin API token (OAuth 2.0 client credentials grant).
 * Tokens are cached with a 1-minute expiry buffer.
 */

import { fetchWithTimeout } from '@/infra/http/fetch-with-timeout';

const TOKEN_REFRESH_BUFFER_MS = 60_000;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let tokenFetchPromise: Promise<string> | null = null;

function getShopDomain(): string {
  const url = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL ?? process.env.SHOPIFY_ADMIN_URL;
  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL or SHOPIFY_ADMIN_URL.',
    );
  }

  const { hostname } = new URL(url);
  const match = hostname.match(/^([a-zA-Z0-9-]+)\.myshopify\.com$/);
  return match?.[1] ?? hostname;
}

export async function getAdminAccessToken(): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing SHOPIFY_CLIENT_ID and/or SHOPIFY_CLIENT_SECRET.');
  }

  if (cachedToken && Date.now() < tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }
  if (tokenFetchPromise) return tokenFetchPromise;

  const shop = getShopDomain();
  const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;

  tokenFetchPromise = (async (): Promise<string> => {
    try {
      const response = await fetchWithTimeout(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (text.includes('app_not_installed')) {
          throw new Error(`Shopify app is not installed on store "${shop}".`);
        }
        if (text.includes('invalid_client') || text.includes('invalid_grant')) {
          throw new Error('Invalid SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET.');
        }
        throw new Error(
          `Shopify token request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { access_token: string; expires_in: number };
      if (!data.access_token) {
        throw new Error('Shopify OAuth response missing access_token');
      }

      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in ?? 86400) * 1000;
      return cachedToken;
    } finally {
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
}
