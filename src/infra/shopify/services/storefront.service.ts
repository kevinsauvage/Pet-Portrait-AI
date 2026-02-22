import type { Product } from '@/domains/products/models';
import { storefrontSdk } from '@/infra/shopify/client';
import { ShopifyProductRepository } from '@/infra/shopify/repositories/product.repository';

const productRepo = new ShopifyProductRepository();

export const ShopifyStorefrontService = {
  async getProducts(first = 8, sortKey?: string): Promise<Product[]> {
    return productRepo.findAll(first, sortKey);
  },

  async getProductByHandle(handle: string): Promise<Product | null> {
    return productRepo.findByHandle(handle);
  },

  getStorefrontSdk: storefrontSdk,
};
