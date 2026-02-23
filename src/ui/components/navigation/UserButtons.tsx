'use client';
import Link from 'next/link';

import useCartContext from '@/contexts/CartContext/useCartContext';
import config from '@/core/config';
import { Badge } from '@/ui/primitives/badge';

import ThemeToggle from './ThemeToggle';

import { Search, ShoppingBag, User } from 'lucide-react';

const UserButtons = ({ className }: { className?: string }) => {
  const { cart } = useCartContext();

  return (
    <div className={`hidden md:flex md:items-center md:order-3 gap-1.5 lg:gap-2 ${className}`}>
      <ThemeToggle />
      <Link
        aria-label="Search"
        className="group cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        href={config.routes.search}
      >
        <Search
          size={20}
          strokeWidth={1.5}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>

      <Link
        aria-label={'User account'}
        className="group cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        href={config.routes.account}
      >
        <User
          size={20}
          strokeWidth={1.5}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>

      <Link
        className="group relative cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        href={config.routes.cart}
        aria-label={'Toggle Checkout'}
      >
        <ShoppingBag
          size={20}
          strokeWidth={1.5}
          className="text-secondary group-hover:text-primary transition-colors"
        />
        <Badge className="absolute -top-1 -right-1 rounded-full text-[10px] leading-none font-bold bg-red-700 text-white px-1.5 py-0.5 min-w-[18px] text-center">
          {cart?.totalQuantity || 0}
        </Badge>
      </Link>
    </div>
  );
};

export default UserButtons;
