import { cache } from 'react';

import { withCache } from '@/infra/cache';
import { storefrontSdk } from '@/infra/shopify/client';
import type {
  GetProductByHandleQuery,
  ProductRecommendationsQuery,
} from '@/infra/shopify/storefront';
import { stripHtmlToText } from '@/lib/html';

type ProductDetails = {
  product: GetProductByHandleQuery['product'] | null | undefined;
  recommendations: ProductRecommendationsQuery | null;
};

type ProductSeo = {
  title: string;
  description: string;
  image?: string;
};

const getProductByHandleInternal = cache(async (handle: string) => {
  return storefrontSdk().getProductByHandle({
    handle,
    identifiers: [],
  });
});

const getProductByHandle = withCache(getProductByHandleInternal, {
  prefix: 'product-details',
  ttlMs: 3600000,
});

async function getProductRecommendationsInternal(productId: string): Promise<ProductRecommendationsQuery | null> {
  return storefrontSdk().productRecommendations({
    identifiers: [],
    productId,
  });
}

const getProductRecommendations = withCache(getProductRecommendationsInternal, {
  prefix: 'product-recommendations',
  ttlMs: 3600000,
});

export async function getProductDetails(handle: string): Promise<ProductDetails> {
  const { product } = await getProductByHandle(handle);
  if (!product) {
    return { product: null, recommendations: null };
  }

  const recommendations = await getProductRecommendations(product.id);

  return { product, recommendations };
}

export async function getProductSeo(handle: string): Promise<ProductSeo | null> {
  const { product } = await getProductByHandle(handle);
  if (!product) return null;

  const title = product.seo?.title || product.title || 'Product';
  const description =
    product.seo?.description || stripHtmlToText(product.descriptionHtml ?? '') || 'Product';

  const firstImage = product.images?.edges?.[0]?.node?.url;

  return { title, description, image: firstImage };
}
