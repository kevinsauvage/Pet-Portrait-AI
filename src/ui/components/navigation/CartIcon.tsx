'use client';

import Link from 'next/link';

import useCartContext from '@/contexts/CartContext/useCartContext';
import config from '@/core/config';
import { Badge } from '@/ui/primitives/badge';

import { ShoppingBag } from 'lucide-react';

const CartIcon = () => {
  const { cart } = useCartContext();
  const itemCount = cart.totalQuantity || 0;

  return (
    <Link
      href={config.routes.cart}
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : ''}`}
      className="group relative ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-accent hover:text-foreground"
    >
      <ShoppingBag size={18} strokeWidth={1.75} />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Link>
  );
};

export default CartIcon;
