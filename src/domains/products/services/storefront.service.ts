import { ShopifyProductRepository } from '@/domains/products/repositories/product.repository';
import type { Product } from '@/domains/products/validation';
import { storefrontSdk } from '@/infra/shopify/client';

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
