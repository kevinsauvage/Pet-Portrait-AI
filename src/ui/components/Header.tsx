import Link from 'next/link';

import config from '@/core/config';
import { getShopifyToken } from '@/lib/server/shopify-helpers';
import type { GetMenuByHandleQuery } from '@/modules/shopify/storefront';
import Logo from '@/ui/components/Logo';
import UserButtons from '@/ui/components/UserButtons';

import HamburgerMenu from './HamburgerMenu';

const NAV_LINKS = [
  { label: 'Create', href: config.routes.create },
  { label: 'Styles', href: config.routes.styles },
  { label: 'Gallery', href: config.routes.gallery },
  { label: 'Shop', href: config.routes.collection },
] as const;

const Header = async ({
  headerMenu,
}: {
  headerMenu: GetMenuByHandleQuery['menu'] | null | undefined;
}) => {
  const shopifyToken = await getShopifyToken();
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="w-full flex items-center justify-between h-16 md:h-[72px]">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <UserButtons className="hidden md:flex" />
            <div className="md:hidden">
              <HamburgerMenu headerMenu={headerMenu} shopifyToken={shopifyToken || null} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
