import { storefrontSdk } from '@/infra/shopify/client';

import type { AiPortraitProduct, AiPortraitProductVariant } from './products';

function mapVariant(node: {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}): AiPortraitProductVariant {
  return {
    id: node.id,
    title: node.title,
    sku: node.sku ?? '',
    price: Number(node.price.amount),
    currencyCode: node.price.currencyCode,
    availableForSale: node.availableForSale,
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
}): AiPortraitProduct {
  const variants =
    node.variants?.edges?.map((edge) => mapVariant(edge.node)).filter((v) => v.sku.trim() !== '') ??
    [];

  const gelatoMetafield = node.metafields?.find(
    (mf) => mf?.namespace === 'gelato' && mf?.key === 'productUid',
  );

  return {
    shopifyProductId: node.id,
    handle: node.handle,
    title: node.title,
    description: node.descriptionHtml ?? '',
    image: node.featuredImage?.url ?? node.images?.edges?.[0]?.node?.url,
    gelatoProductUid: gelatoMetafield?.value ?? undefined,
    variants,
  };
}

export async function getAiPortraitProductsByCollection(
  collectionHandle: string,
): Promise<{ collectionTitle: string; products: AiPortraitProduct[] } | null> {
  const response = await storefrontSdk().collection({
    handle: collectionHandle,
    first: 50,
    identifiers: [],
  });

  const { collection } = response;
  if (!collection) return null;

  const products = collection.products?.edges?.map((edge) => mapProduct(edge.node)) ?? [];

  return {
    collectionTitle: collection.title,
    products,
  };
}
