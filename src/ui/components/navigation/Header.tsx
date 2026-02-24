import { getShopifyToken } from '@/infra/shopify/server';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import Logo from '@/ui/components/navigation/Logo';
import { getNavLinks } from '@/ui/components/navigation/nav-links-utils';
import NavLinks from '@/ui/components/navigation/NavLinks';
import UserButtons from '@/ui/components/navigation/UserButtons';

import HamburgerMenu from './HamburgerMenu';

const Header = async ({
  headerMenu,
}: {
  headerMenu: GetMenuByHandleQuery['menu'] | null | undefined;
}) => {
  const shopifyToken = await getShopifyToken();
  const navLinks = getNavLinks(headerMenu);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="w-full flex items-center justify-between h-16 md:h-[72px]">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden md:block">
              <NavLinks links={navLinks} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserButtons className="hidden md:flex" />
            <div className="md:hidden">
              <HamburgerMenu navLinks={navLinks} shopifyToken={shopifyToken || null} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
