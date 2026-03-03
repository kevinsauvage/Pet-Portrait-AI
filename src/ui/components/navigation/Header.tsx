import Link from 'next/link';

import config from '@/core/config';
import { getShopifyToken } from '@/infra/shopify/server';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import Logo from '@/ui/components/navigation/Logo';
import { getNavLinks } from '@/ui/components/navigation/nav-links-utils';
import NavLinks from '@/ui/components/navigation/NavLinks';
import UserButtons from '@/ui/components/navigation/UserButtons';

import HamburgerMenu from './HamburgerMenu';

import { ShoppingBag } from 'lucide-react';

const Header = async ({
  headerMenu,
}: {
  headerMenu: GetMenuByHandleQuery['menu'] | null | undefined;
}) => {
  const shopifyToken = await getShopifyToken();
  const navLinks = getNavLinks(headerMenu);

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-50 border-b border-border/60 bg-background/90 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 w-full items-center justify-between md:h-[68px]">
          <div className="flex items-center gap-6 lg:gap-8">
            <Logo />
            <nav className="hidden md:block" aria-label="Main navigation">
              <NavLinks links={navLinks} />
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <UserButtons className="hidden md:flex" />
            <Link
              href={config.routes.cart}
              aria-label="Shopping cart"
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
            </Link>
            <div className="ml-1 md:hidden">
              <HamburgerMenu navLinks={navLinks} shopifyToken={shopifyToken || null} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
