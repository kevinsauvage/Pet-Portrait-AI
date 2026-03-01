import { logger } from '@/core/utils/logger';
import { adminSdk } from '@/infra/shopify/client';

const NAMESPACE = 'gelato';

export type SetGelatoMetafieldsParams = {
  shopifyProductGid: string;
  gelatoProductId: string;
  shopifyVariantGid?: string;
  gelatoVariantId?: string | null;
};

type MetafieldUserError = {
  field?: string[] | null;
  message: string;
};

export async function setGelatoMetafieldsOnProduct(
  params: SetGelatoMetafieldsParams,
): Promise<{ success: boolean; userErrors?: MetafieldUserError[] }> {
  const { shopifyProductGid, gelatoProductId, shopifyVariantGid, gelatoVariantId } = params;

  const metafields = [
    {
      ownerId: shopifyProductGid,
      namespace: NAMESPACE,
      key: 'product_id',
      type: 'single_line_text_field',
      value: gelatoProductId,
    },
    ...(shopifyVariantGid && gelatoVariantId
      ? [
          {
            ownerId: shopifyVariantGid,
            namespace: NAMESPACE,
            key: 'variant_id',
            type: 'single_line_text_field',
            value: gelatoVariantId,
          },
        ]
      : []),
  ];

  const response = await adminSdk().MetafieldsSet({ metafields });
  const errors = response?.metafieldsSet?.userErrors;

  if (errors && errors.length > 0) {
    logger.error('setGelatoMetafieldsOnProduct', { userErrors: errors, shopifyProductGid });
    return { success: false, userErrors: errors };
  }

  return { success: true };
}
