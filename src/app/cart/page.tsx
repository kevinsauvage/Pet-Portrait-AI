import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { CartService } from '@/domains/cart/services/cart.service';
import PageBanner from '@/ui/components/PageBanner';

import CartEmptyState from './_components/CartEmptyState';
import CartHeader from './_components/CartHeader';
import CartItemsList from './_components/CartItemsList';
import CartPromoCode from './_components/CartPromoCode';
import CartSummary from './_components/CartSummary';

import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: seo.cart.description,
  title: seo.cart.title,
};

const CartPage = async () => {
  const cartId = await CartService.getCartId();
  const cart = cartId ? await CartService.getCart(cartId) : null;
  const isEmpty = !cart?.lines?.edges || cart.lines.edges.length === 0;

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 md:px-6">
      <PageBanner title="Your Cart" className="w-full pb-4 md:pb-6">
        {!isEmpty && (
          <div className="flex items-center justify-between gap-4 w-full flex-wrap">
            <Link
              href="/collections"
              className="group flex items-center text-body-sm text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1 text-secondary group-hover:text-primary transition-colors" />
              Continue Shopping
            </Link>
            <CartHeader />
          </div>
        )}
      </PageBanner>

      {isEmpty ? (
        <CartEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <CartItemsList />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <CartSummary />
            <CartPromoCode />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
