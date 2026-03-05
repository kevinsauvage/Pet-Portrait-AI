'use client';

import useCartContext from '@/contexts/CartContext/useCartContext';
import { formatPrice } from '@/lib/format';
import CheckoutButton from '@/ui/components/cart/CheckoutButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';
import { Separator } from '@/ui/primitives/separator';

const CartSummary = () => {
  const { cart } = useCartContext();
  const subtotal = Number.parseFloat(cart.cost.subtotalAmount.amount);
  const total = Number.parseFloat(cart.cost.totalAmount.amount);
  const tax = Number.parseFloat(cart.cost.totalTaxAmount?.amount ?? '0');
  const discount = subtotal - total + tax;
  const hasDiscount = discount > 0;
  const { currencyCode } = cart.cost.subtotalAmount;

  return (
    <Card className="border-border/70 lg:top-24">
      <CardHeaderPattern className="pb-3" title="Order Summary" size={4} />
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-muted-foreground">Subtotal</span>
            <span className="text-body-sm font-medium tabular-nums">
              {formatPrice(subtotal, currencyCode)}
            </span>
          </div>
          {hasDiscount && (
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-body-sm text-muted-foreground">Discount</span>
              <span className="text-body-sm font-semibold tabular-nums text-success">
                -{formatPrice(discount, currencyCode)}
              </span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Tax</span>
              <span className="text-body-sm font-medium tabular-nums">
                {formatPrice(tax, currencyCode)}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-border/60" />

        <div className="flex items-baseline justify-between">
          <span className="text-body font-semibold">Total</span>
          <span className="text-heading-4 font-bold tabular-nums text-primary">
            {formatPrice(total, currencyCode)}
          </span>
        </div>

        {hasDiscount && (
          <div className="rounded-lg bg-success/8 px-3 py-2 text-center">
            <p className="text-caption-sm font-medium text-success">
              You saved {formatPrice(discount, currencyCode)}
            </p>
          </div>
        )}
      </CardContent>
      {cart.checkoutUrl && cart.totalQuantity > 0 && (
        <CardFooter className="pt-2">
          <CheckoutButton checkoutUrl={String(cart.checkoutUrl)} />
        </CardFooter>
      )}
    </Card>
  );
};

export default CartSummary;
