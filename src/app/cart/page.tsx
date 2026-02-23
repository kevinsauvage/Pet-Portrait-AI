import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { CartService } from '@/domains/cart/services/cart.service';
import CartEmptyState from '@/ui/components/cart/CartEmptyState';
import CartHeader from '@/ui/components/cart/CartHeader';
import CartItemsList from '@/ui/components/cart/CartItemsList';
import CartPromoCode from '@/ui/components/cart/CartPromoCode';
import CartSummary from '@/ui/components/cart/CartSummary';
import PageBanner from '@/ui/components/shared/PageBanner';

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
    <div className="py-10 md:py-14 max-w-7xl mx-auto px-4 md:px-6">
      <PageBanner
        eyebrow="Checkout"
        title="Your Cart"
        description="Review your order, apply discounts, and complete your purchase."
        className="w-full pb-6"
      >
        {!isEmpty && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <Link
              href="/shop"
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
          <div className="lg:col-span-2 space-y-6">
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
