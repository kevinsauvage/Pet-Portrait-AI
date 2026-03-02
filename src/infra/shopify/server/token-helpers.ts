import { cookies } from 'next/headers';

import config from '@/core/config';
import { getSecureCookieOptions } from '@/core/utils/cookie-security';
import { logger } from '@/core/utils/logger';

import { storefrontSdk } from '../client';
import type { CustomerAccessToken } from '../storefront';

/**
 * Shopify token management helpers
 * Server-side utilities for managing Shopify customer access tokens
 */
export const setShopifyToken = async (customerAccessToken: CustomerAccessToken): Promise<void> => {
  if (!customerAccessToken) return;
  const { accessToken, expiresAt } = customerAccessToken || {};
  if (!accessToken || !expiresAt) return;

  const expiresAtDate = new Date(expiresAt as string);

  const cookieStore = await cookies();

  cookieStore.set({
    name: config.cookies.shopifyToken,
    value: accessToken,
    ...getSecureCookieOptions({ expires: expiresAtDate }),
  });

  cookieStore.set({
    name: config.cookies.shopifyTokenExpire,
    value: expiresAtDate.toISOString(),
    ...getSecureCookieOptions({ expires: expiresAtDate }),
  });
};

const isTokenExpiredOrExpiringSoon = (expiresAt: string): boolean => {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  return expiryDate <= fiveMinutesFromNow;
};

const renewTokenIfNeeded = async (token: string): Promise<CustomerAccessToken | null> => {
  try {
    const response = await storefrontSdk('no-store').customerAccessTokenRenew({
      customerAccessToken: token,
    });

    const { customerAccessToken, userErrors } = response?.customerAccessTokenRenew || {};

    if (userErrors && userErrors.length > 0) {
      logger.error('Token renewal failed with user errors', { context: 'renewTokenIfNeeded', metadata: { userErrors } });
      return null;
    }

    if (customerAccessToken) {
      await setShopifyToken(customerAccessToken);
      return customerAccessToken;
    }

    return null;
  } catch (error) {
    logger.error('Failed to renew token', { context: 'renewTokenIfNeeded', error });
    return null;
  }
};

export const getShopifyToken = async (): Promise<
  CustomerAccessToken['accessToken'] | undefined
> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookies.shopifyToken)?.value;
  const expiresAt = cookieStore.get(config.cookies.shopifyTokenExpire)?.value;

  if (!token) return undefined;

  if (expiresAt && isTokenExpiredOrExpiringSoon(expiresAt)) {
    const renewedToken = await renewTokenIfNeeded(token);
    return renewedToken?.accessToken;
  }

  return token;
};

export const clearShopifyToken = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(config.cookies.shopifyToken);
  cookieStore.delete(config.cookies.shopifyTokenExpire);
};

export const getShopifyCartId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(config.cookies.cartId)?.value;
};
