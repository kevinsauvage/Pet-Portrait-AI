import { logger } from '@/core/utils/logger.server';
import { storefrontSdk } from '@/infra/shopify/client';
import { isShopifyCustomerAuthFailure } from '@/infra/shopify/customer-auth-failure';
import { clearShopifyToken, getShopifyToken } from '@/infra/shopify/server';

export const getUser = async () => {
  const customerAccessToken = await getShopifyToken();

  if (!customerAccessToken) return;

  try {
    const response = await storefrontSdk('no-store').getCustomer({
      customerAccessToken,
      metafields: [],
    });

    if (!response?.customer) {
      await clearShopifyToken();
      return;
    }

    return response.customer;
  } catch (error) {
    if (isShopifyCustomerAuthFailure(error)) {
      await clearShopifyToken();
      return null;
    }
    logger.error('Failed to get user', { context: 'getUser', error });
    return null;
  }
};
