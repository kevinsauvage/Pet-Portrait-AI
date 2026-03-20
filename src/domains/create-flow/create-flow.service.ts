import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { logger } from '@/core/utils/logger.server';
import { adminSdk, storefrontSdk } from '@/infra/shopify/client';
import { getShopifyToken } from '@/infra/shopify/server';

const CREATE_FLOW_METAFIELD = { key: 'create_flow_url', namespace: 'custom' };

/**
 * Returns the saved create flow URL for the current user, or null if none.
 * Only works for logged-in users.
 */
export async function getCreateFlowUrl(): Promise<string | null> {
  const shopifyToken = await getShopifyToken();
  if (!shopifyToken) return null;

  try {
    const response = await storefrontSdk('no-store').getCustomerMetafields({
      customerAccessToken: shopifyToken,
      metafields: [CREATE_FLOW_METAFIELD],
    });

    const metafields = response?.customer?.metafields;
    const value = metafields?.[0]?.value;

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return null;
  } catch (error) {
    logger.error('Failed to get create flow URL', {
      context: 'CreateFlowService.getCreateFlowUrl',
      error,
    });
    return null;
  }
}

/**
 * Saves the create flow URL to the customer metafield.
 * Requires authenticated user with customer ID.
 */
export async function setCreateFlowUrl(
  customerId: string,
  url: string,
): Promise<{ success: boolean; message?: string }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return clearCreateFlowUrl(customerId);
  }

  try {
    const response = await adminSdk().MetafieldsSet({
      metafields: [
        {
          key: CREATE_FLOW_METAFIELD.key,
          namespace: CREATE_FLOW_METAFIELD.namespace,
          ownerId: customerId,
          type: 'single_line_text_field',
          value: trimmed,
        },
      ],
    });

    const errors = response?.metafieldsSet?.userErrors;
    if (errors && errors.length > 0) {
      logger.error('MetafieldsSet errors when saving create flow URL', {
        context: 'CreateFlowService.setCreateFlowUrl',
        metadata: { errors },
      });
      return { success: false, message: 'Failed to save create flow progress' };
    }

    revalidatePath(config.routes.create);
    return { success: true };
  } catch (error) {
    logger.error('Failed to set create flow URL', {
      context: 'CreateFlowService.setCreateFlowUrl',
      error,
    });
    return { success: false, message: 'Failed to save create flow progress' };
  }
}

/**
 * Clears the create flow URL from the customer metafield.
 */
export async function clearCreateFlowUrl(
  customerId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await adminSdk().MetafieldsDelete({
      metafields: [
        {
          ownerId: customerId,
          namespace: CREATE_FLOW_METAFIELD.namespace,
          key: CREATE_FLOW_METAFIELD.key,
        },
      ],
    });

    const errors = response?.metafieldsDelete?.userErrors;
    if (errors && errors.length > 0) {
      logger.error('MetafieldsDelete errors when clearing create flow URL', {
        context: 'CreateFlowService.clearCreateFlowUrl',
        metadata: { errors },
      });
      return { success: false, message: 'Failed to clear create flow' };
    }

    revalidatePath(config.routes.create);
    return { success: true };
  } catch (error) {
    logger.error('Failed to clear create flow URL', {
      context: 'CreateFlowService.clearCreateFlowUrl',
      error,
    });
    return { success: false, message: 'Failed to clear create flow' };
  }
}
