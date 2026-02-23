import { cache } from 'react';

import { storefrontSdk } from '@/infra/shopify/client';
import type { GetProductByHandleQuery, ProductRecommendationsQuery } from '@/infra/shopify/storefront';
import { stripHtmlToText } from '@/lib/html';

type ProductDetails = {
  product: GetProductByHandleQuery['product'] | null | undefined;
  recommendations: ProductRecommendationsQuery | null;
};

type ProductSeo = {
  title: string;
  description: string;
};

const getProductByHandle = cache(async (handle: string) => {
  return storefrontSdk().getProductByHandle({
    handle,
    identifiers: [],
  });
});

export async function getProductDetails(handle: string): Promise<ProductDetails> {
  const { product } = await getProductByHandle(handle);
  if (!product) {
    return { product: null, recommendations: null };
  }

  const recommendations = await storefrontSdk().productRecommendations({
    identifiers: [],
    productId: product.id,
  });

  return { product, recommendations };
}

export async function getProductSeo(handle: string): Promise<ProductSeo | null> {
  const { product } = await getProductByHandle(handle);
  if (!product) return null;

  const title = product.seo?.title || product.title || 'Product';
  const description =
    product.seo?.description || stripHtmlToText(product.descriptionHtml ?? '') || 'Product';

  return { title, description };
}
