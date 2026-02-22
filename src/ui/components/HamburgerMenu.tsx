'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import config from '@/core/config';
import type { GetMenuByHandleQuery, MenuItem } from '@/infra/shopify/storefront';
import { cn } from '@/lib/cn';
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
  ChevronDown,
  ChevronRight,
  Heart,
  Home,
  Image,
  LogOut,
  Menu,
  Palette,
  Search,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';

const HamburgerMenu = ({
  headerMenu,
  shopifyToken,
}: {
  headerMenu: GetMenuByHandleQuery['menu'] | null | undefined;
  shopifyToken: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = (id: string) => {
    setExpandedMenus((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const userMenuItems = [
    { icon: <Home className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-home', link: '/', text: 'Home' },
    { icon: <Sparkles className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-create', link: config.routes.create, text: 'Create Portrait' },
    { icon: <Palette className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-styles', link: config.routes.styles, text: 'Portrait Styles' },
    { icon: <Image className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-gallery', link: config.routes.gallery, text: 'Gallery' },
    { icon: <Search className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-search', link: config.routes.search, text: 'Search' },
    {
      icon: <User className="text-secondary group-hover:text-primary transition-colors" size={18} />,
      id: 'nav-account',
      link: shopifyToken ? config.routes.account : config.routes.login,
      text: shopifyToken ? 'Account' : 'Sign In',
    },
    { icon: <Heart className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-wishlist', link: config.routes.wishlist, text: 'Wishlist' },
    { icon: <ShoppingBag className="text-secondary group-hover:text-primary transition-colors" size={18} />, id: 'nav-cart', link: config.routes.cart, text: 'Cart' },
    shopifyToken ? {
      icon: <LogOut className="text-secondary group-hover:text-primary transition-colors" size={18} />,
      id: 'nav-logout',
      link: config.routes.logout,
      text: 'Sign Out',
    } : null,
  ].filter(Boolean) as Array<{ icon: React.ReactNode; id: string; link: string; text: string }>;

  const menuItems = headerMenu?.items || [];

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedMenus[item.id];

    return (
      <div key={item.id}>
        <button
          className={cn(
            'flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-body-sm',
            level === 0 ? 'font-medium' : '',
            'hover:bg-accent hover:text-foreground rounded-md',
            isExpanded ? 'bg-accent text-foreground' : '',
            pathname === new URL(typeof item.url === 'string' ? item.url : '').pathname
              ? 'text-primary font-semibold'
              : '',
          )}
          style={{ paddingLeft: `${level * 12 + 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else if (typeof item.url === 'string') {
              const path = new URL(item.url).pathname;
              const parameters = new URL(item.url).searchParams;
              router.push(`${path}?${parameters.toString()}`);
              setOpen(false);
            }
          }}
        >
          <span>{item.title}</span>
          {hasChildren && (
            <span className="text-secondary">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1">{item.items.map((child) => renderMenuItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

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
            {menuItems.map((item) => renderMenuItem(item as MenuItem))}
          </div>
        </div>
        <SheetFooter className="border-t p-2">
          <div className="w-full space-y-0.5">
            {userMenuItems.map((item) => (
              <button
                key={item.id}
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
