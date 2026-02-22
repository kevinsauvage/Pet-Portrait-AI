'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import config from '@/core/config';
import { cn } from '@/lib/cn';
import type { NavLink } from '@/ui/components/NavLinks/nav-links-utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet';

import {
  Heart,
  Home,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';

const HamburgerMenu = ({
  navLinks,
  shopifyToken,
}: {
  navLinks: NavLink[];
  shopifyToken: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userMenuItems = [
    { icon: <Home className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-home', link: '/', text: 'Home' },
    { icon: <Search className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-search', link: config.routes.search, text: 'Search' },
    {
      icon: <User className="text-secondary group-hover:text-primary transition-colors" size={18} />,
      id: 'nav-account',
      link: shopifyToken ? config.routes.account : config.routes.login,
      text: shopifyToken ? 'Account' : 'Sign In',
    },
    { icon: <Heart className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-wishlist', link: config.routes.wishlist, text: 'Wishlist' },
    { icon: <ShoppingBag className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-cart', link: config.routes.cart, text: 'Cart' },
    shopifyToken
      ? {
          icon: <LogOut className="text-secondary group-hover:text-primary transition-colors" size={18} />,
          id: 'nav-logout',
          link: config.routes.logout,
          text: 'Sign Out',
        }
      : null,
  ].filter(Boolean) as Array<{ icon: React.ReactNode; id: string; link: string; text: string }>;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Menu" type="button" className="cursor-pointer p-1">
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full sm:max-w-sm overflow-scroll max-h-dvh">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-5 border-b">
            <SheetTitle className="text-heading-4">PetPortrait AI</SheetTitle>
            <SheetDescription className="text-body-sm text-secondary">
              Create stunning AI pet portraits
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto py-2 px-2">
            <div className="w-full space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.href + link.label}
                  type="button"
                  className={cn(
                    'flex w-full cursor-pointer items-center px-4 py-2.5 text-body-sm font-medium hover:bg-accent hover:text-foreground rounded-md',
                    pathname === link.href ? 'bg-accent text-primary' : '',
                  )}
                  onClick={() => {
                    router.push(link.href);
                    setOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="border-t p-2">
          <div className="w-full space-y-0.5">
            {userMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'group flex w-full cursor-pointer items-center gap-3 rounded-md px-4 py-2.5 text-body-sm hover:bg-accent',
                  pathname === item.link ? 'bg-accent text-primary font-medium' : '',
                )}
                onClick={() => {
                  router.push(item.link);
                  setOpen(false);
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
