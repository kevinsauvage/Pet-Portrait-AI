'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import config from '@/core/config';
import siteMetadata from '@/core/config/siteMetadata';
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

import { Heart, LogOut, Menu, Search, ShoppingBag, Sparkles, User } from 'lucide-react';

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

  const accountItems = [
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
      text: shopifyToken ? 'My Account' : 'Sign In',
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

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const navItemClass = (href: string) =>
    cn(
      'flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium transition-all duration-150',
      pathname === href || (href !== '/' && pathname.startsWith(href))
        ? 'bg-primary/10 text-primary'
        : 'text-foreground hover:bg-accent/70 hover:text-foreground',
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-accent/70 hover:text-foreground"
        >
          <Menu size={19} strokeWidth={1.75} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[300px]"
      >
        {/* Brand header */}
        <SheetHeader className="relative overflow-hidden border-b border-border/50 px-5 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_0%_50%,color-mix(in_srgb,var(--primary)_8%,transparent),transparent)]" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles size={14} strokeWidth={2} />
            </span>
            <div>
              <SheetTitle className="text-body font-bold tracking-tight text-foreground">
                {siteMetadata.companyName}
              </SheetTitle>
              <SheetDescription className="text-caption-sm text-muted-foreground">
                Custom AI pet portraits
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 gap-5">

          {/* Primary nav links */}
          {navLinks.length > 0 && (
            <div className="space-y-1">
              <p className="mb-2 px-4 text-caption-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Explore
              </p>
              {navLinks.map((link) => (
                <button
                  key={link.href + link.label}
                  type="button"
                  className={navItemClass(link.href)}
                  onClick={() => navigate(link.href)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px w-full bg-border/50" />

          {/* Account / utility items */}
          <div className="space-y-1">
            <p className="mb-2 px-3.5 text-caption-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Account
            </p>
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isSignOut = item.id === 'nav-logout';
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium transition-all duration-150',
                    isSignOut
                      ? 'text-destructive hover:bg-destructive/8 hover:text-destructive'
                      : navItemClass(item.link),
                  )}
                  onClick={() => navigate(item.link)}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    className={cn('shrink-0', isSignOut ? 'text-destructive' : 'text-muted-foreground')}
                  />
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer strip */}
        <div className="border-t border-border/50 px-5 py-4">
          <p className="text-caption-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteMetadata.companyName}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
