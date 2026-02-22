import config from '@/core/config';
import { safeLogError } from '@/core/utils/api-responses';

import { getSdk as getAdminSdk } from './admin/index';
import type { SdkFunctionWrapper } from './storefront/index';
import { getSdk as getStorefrontSdk } from './storefront/index';
import { getAdminAccessToken } from './tokens/admin-token';
import { fetchWithRetry } from './tokens/fetch-with-retry';
import { getStorefrontAccessToken } from './tokens/storefront-token';
import { buildExtraHeaders } from './helpers';

import { GraphQLClient } from 'graphql-request';

const ADMIN_URL = process.env.SHOPIFY_ADMIN_URL;
const SHOPIFY_URL = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;

if (!SHOPIFY_URL) throw new Error('Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL');
if (!ADMIN_URL) throw new Error('Missing SHOPIFY_ADMIN_URL');

const createStorefrontClient = (cacheOption: 'default' | 'no-store' = 'default') => {
  return new GraphQLClient(SHOPIFY_URL, {
    fetch: async (url: RequestInfo | URL, params?: RequestInit) => {
      const token = await getStorefrontAccessToken();
      const headers = new Headers(params?.headers);
      headers.set('Content-Type', 'application/json');
      headers.set('X-Shopify-Storefront-Access-Token', token);

      const fetchOptions: RequestInit = { ...params, headers };
      if (cacheOption === 'no-store') {
        fetchOptions.cache = 'no-store';
        fetchOptions.next = { revalidate: 0 };
      } else {
        fetchOptions.next = { revalidate: config.constants.revalidate.shopify };
      }

      const response = await fetchWithRetry(url, fetchOptions);
      if (!response.ok) throw new Error(`Shopify fetch failed: ${response.statusText}`);
      return response;
    },
  });
};

const storefrontClient = createStorefrontClient('default');

const defaultWrapper: SdkFunctionWrapper = async (
  action,
  operationName,
  operationType,
  variables: Record<string, unknown>,
) => {
  const extraHeader = await buildExtraHeaders({});
  try {
    return await action(extraHeader);
  } catch (error) {
    safeLogError(`GraphQL request - ${operationName}`, {
      operationType,
      variables,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const storefrontSdk = (cacheOption: 'default' | 'no-store' = 'default') => {
  const client = cacheOption === 'no-store' ? createStorefrontClient('no-store') : storefrontClient;
  return getStorefrontSdk(client, defaultWrapper);
};

export const adminClient = new GraphQLClient(ADMIN_URL, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('X-Shopify-Access-Token', token);
    return fetchWithRetry(input, { ...init, headers });
  },
});

export const adminSdk = () => getAdminSdk(adminClient, defaultWrapper);
