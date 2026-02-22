/**
 * Storefront API token: uses static env var if set, otherwise creates one via Admin API.
 * Result is cached with single-flight deduplication.
 */

import { getAdminAccessToken } from './admin-token';

const MUTATION = `
  mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
    storefrontAccessTokenCreate(input: $input) {
      storefrontAccessToken { accessToken }
      userErrors { field, message }
    }
  }
`;

let cachedStorefrontToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export async function getStorefrontAccessToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_STORE_FRONT_ACCESS_TOKEN?.trim();
  if (staticToken) return staticToken;

  if (cachedStorefrontToken) return cachedStorefrontToken;
  if (tokenPromise) return tokenPromise;

  const adminUrl = process.env.SHOPIFY_ADMIN_URL;
  if (!adminUrl) {
    throw new Error('Missing SHOPIFY_ADMIN_URL. Set it or set SHOPIFY_STORE_FRONT_ACCESS_TOKEN.');
  }

  tokenPromise = (async () => {
    try {
      const adminToken = await getAdminAccessToken();
      const res = await fetch(adminUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({
          query: MUTATION,
          variables: { input: { title: 'Next.js Storefront' } },
        }),
      });

      if (!res.ok) {
        throw new Error(`Admin API request failed: ${res.status} ${res.statusText}`);
      }

      const json = (await res.json()) as {
        data?: {
          storefrontAccessTokenCreate?: {
            storefrontAccessToken?: { accessToken: string };
            userErrors: Array<{ message: string }>;
          };
        };
        errors?: Array<{ message: string }>;
      };

      const gqlErrors = json.errors;
      if (gqlErrors?.length) {
        throw new Error(`Storefront token creation failed: ${gqlErrors.map((e) => e.message).join('; ')}`);
      }

      const create = json.data?.storefrontAccessTokenCreate;
      const userErrors = create?.userErrors ?? [];
      if (userErrors.length > 0) {
        throw new Error(`Storefront token creation failed: ${userErrors.map((e) => e.message).join('; ')}`);
      }

      const token = create?.storefrontAccessToken?.accessToken;
      if (!token) throw new Error('Storefront token creation returned no accessToken');

      cachedStorefrontToken = token;
      return token;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}
