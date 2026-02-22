'use server';

import type { CartFieldsFragment } from '@/infra/shopify/storefront';

import { CartService } from '../services/cart.service';

export async function createCartAction(): Promise<CartFieldsFragment> {
  return CartService.createCart();
}
