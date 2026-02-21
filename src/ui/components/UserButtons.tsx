'use client';
import Link from 'next/link';

import useCartContext from '@/contexts/CartContext/useCartContext';
import config from '@/core/config';

import { Badge } from './ui/badge';
import ThemeToggle from './ThemeToggle';

import { Search, ShoppingBag, User } from 'lucide-react';

const UserButtons = ({ className }: { className?: string }) => {
  const { cart } = useCartContext();

  return (
    <div className={`hidden md:flex md:items-center md:order-3 gap-2 lg:gap-4 ${className}`}>
      <ThemeToggle />
      <Link
        aria-label="Search"
        className="group cursor-pointer flex items-center justify-center min-h-11 min-w-11"
        href={config.routes.search}
      >
        <Search
          size={30}
          strokeWidth={1}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>

      <Link
        aria-label={'User account'}
        className="group cursor-pointer flex items-center justify-center min-h-11 min-w-11"
        href={config.routes.account}
      >
        <User
          size={30}
          strokeWidth={1}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>

      <Link
        className="group relative cursor-pointer flex items-center justify-center min-h-11 min-w-11"
        href={config.routes.cart}
        aria-label={'Toggle Checkout'}
      >
        <ShoppingBag
          size={30}
          strokeWidth={1}
          className="text-secondary group-hover:text-primary transition-colors"
        />
        <Badge className="absolute -top-3 -right-3 rounded-full text-caption-sm font-bold bg-red-800 text-white">
          {cart?.totalQuantity || 0}
        </Badge>
      </Link>
    </div>
  );
};

export default UserButtons;
