'use server';

import type { CartFieldsFragment } from '@/infra/shopify/generated/storefront/index';

import { CartService } from './cart.service';

export async function createCartAction(): Promise<CartFieldsFragment> {
  return CartService.createCart();
}
