import { getPrintfulVariantId } from '@/domains/printful/utils';
import { storefrontSdk } from '@/infra/shopify/client';

import { getFirstAvailableVariant } from './utils/product-utils';
import { getAiPortraitCollections } from './get-ai-portrait-collections.service';
import type { AiPortraitProduct, AiPortraitProductVariant } from './types';

const AI_PORTRAIT_METAFIELD_IDENTIFIERS = [{ namespace: 'custom', key: 'variant_id' }];

function mapVariant(node: {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  metafields?: Array<{ namespace: string; key: string; value: string } | null>;
}): AiPortraitProductVariant | null {
  const printfulVariantId = getPrintfulVariantId({
    metafields: node.metafields,
    sku: node.sku,
  });
  if (!printfulVariantId) return null;

  const sku = node.sku ?? '';
  return {
    id: node.id,
    title: node.title,
    sku,
    price: Number(node.price.amount),
    currencyCode: node.price.currencyCode,
    availableForSale: node.availableForSale,
    printfulVariantId,
  };
}

function mapProduct(node: {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string | null;
  featuredImage?: { url: string } | null;
  images?: { edges: { node: { url: string } }[] };
  metafields?: ({ namespace: string; key: string; value: string } | null)[];
  variants?: { edges: { node: Parameters<typeof mapVariant>[0] }[] };
}): AiPortraitProduct | null {
  const mappedVariants =
    node.variants?.edges
      ?.map((edge) => mapVariant(edge.node))
      .filter((v): v is AiPortraitProductVariant => v !== null && v.sku.trim() !== '') ?? [];

  if (mappedVariants.length === 0) {
    return null;
  }

  return {
    shopifyProductId: node.id,
    handle: node.handle,
    title: node.title,
    description: node.descriptionHtml ?? '',
    image: node.featuredImage?.url ?? node.images?.edges?.[0]?.node?.url,
    variants: mappedVariants,
  };
}

export async function getAiPortraitProductsByCollection(
  collectionHandle: string,
): Promise<{ collectionTitle: string; products: AiPortraitProduct[] } | null> {
  const response = await storefrontSdk().collection({
    handle: collectionHandle,
    first: 50,
    identifiers: AI_PORTRAIT_METAFIELD_IDENTIFIERS,
  });

  const { collection } = response;
  if (!collection) return null;

  const products =
    collection.products?.edges
      ?.map((edge) => mapProduct(edge.node))
      .filter((p): p is AiPortraitProduct => p !== null) ?? [];

  return {
    collectionTitle: collection.title,
    products,
  };
}

export async function getAiPortraitProductByHandle(
  handle: string,
): Promise<AiPortraitProduct | null> {
  const response = await storefrontSdk().getProductByHandle({
    handle,
    identifiers: AI_PORTRAIT_METAFIELD_IDENTIFIERS,
  });

  const { product } = response;
  if (!product) return null;

  return mapProduct(product) ?? null;
}

export async function getDefaultAiPortraitProduct(): Promise<{
  product: AiPortraitProduct;
  variant: AiPortraitProductVariant;
} | null> {
  const collections = await getAiPortraitCollections();
  const firstCollection = collections[0];
  if (!firstCollection) return null;

  const data = await getAiPortraitProductsByCollection(firstCollection.handle);
  const firstProduct = data?.products[0];
  if (!firstProduct) return null;

  const variant = getFirstAvailableVariant(firstProduct.variants) ?? firstProduct.variants[0];
  if (!variant) return null;

  return { product: firstProduct, variant };
}
