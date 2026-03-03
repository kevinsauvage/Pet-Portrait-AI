'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import config from '@/core/config';
import { cn } from '@/lib/cn';
import type { NavLink } from '@/ui/components/navigation/nav-links-utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/primitives/sheet';

import { Heart, Home, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';

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
    {
      icon: Home,
      id: 'nav-home',
      link: '/',
      text: 'Home',
    },
    {
      icon: Search,
      id: 'nav-search',
      link: config.routes.search,
      text: 'Search',
    },
    {
      icon: User,
      id: 'nav-account',
      link: shopifyToken ? config.routes.account : config.routes.login,
      text: shopifyToken ? 'Account' : 'Sign In',
    },
    {
      icon: Heart,
      id: 'nav-wishlist',
      link: config.routes.wishlist,
      text: 'Wishlist',
    },
    {
      icon: ShoppingBag,
      id: 'nav-cart',
      link: config.routes.cart,
      text: 'Cart',
    },
    shopifyToken
      ? {
          icon: LogOut,
          id: 'nav-logout',
          link: config.routes.logout,
          text: 'Sign Out',
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    id: string;
    link: string;
    text: string;
  }>;

  const navItemClass = (href: string) =>
    cn(
      'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-body-sm font-medium transition-all duration-150',
      pathname === href
        ? 'bg-primary/10 text-primary'
        : 'text-foreground hover:bg-accent hover:text-foreground',
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[320px]"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-heading-4 font-bold tracking-tight">Menu</SheetTitle>
          <SheetDescription className="text-caption text-muted-foreground">
            Navigate to any section
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
          {navLinks.length > 0 && (
            <div>
              <p className="mb-1.5 px-3.5 text-label-sm text-muted-foreground">Navigation</p>
              <div className="space-y-0.5">
                {navLinks.map((link) => (
                  <button
                    key={link.href + link.label}
                    type="button"
                    className={navItemClass(link.href)}
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
          )}

          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="mb-1.5 px-3.5 text-label-sm text-muted-foreground">Account</p>
            <div className="space-y-0.5">
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={navItemClass(item.link)}
                    onClick={() => {
                      router.push(item.link);
                      setOpen(false);
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
