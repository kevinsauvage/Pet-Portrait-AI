import type { Product } from '@/domains/products/models';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

export function mapShopifyProductToDomain(raw: ProductFieldsFragment): Product {
  const firstVariant = raw.variants?.edges?.[0]?.node;
  const images = raw.images?.edges?.map((edge) => edge.node.url) ?? [];

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.descriptionHtml ?? '',
    descriptionHtml: raw.descriptionHtml,
    images,
    price: Number(firstVariant?.price?.amount ?? 0),
    compareAtPrice: firstVariant?.compareAtPrice
      ? Number(firstVariant.compareAtPrice.amount)
      : undefined,
    currencyCode: firstVariant?.price?.currencyCode ?? 'USD',
    availableForSale: firstVariant?.availableForSale ?? false,
    tags: raw.tags ?? [],
    productType: raw.productType ?? '',
    vendor: raw.vendor ?? '',
    createdAt: raw.updatedAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
}
