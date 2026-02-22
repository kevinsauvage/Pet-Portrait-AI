'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { accountNav } from '@/core/config';
import { cn } from '@/lib/cn';

import { BookText, BookUser, Heart, LogOut, Package, User } from 'lucide-react';

const getLinkIcon = (title: string) => {
  const icons = {
    'Account overview': <User size={16} className="text-secondary shrink-0" />,
    'Address book': <BookUser size={16} className="text-secondary shrink-0" />,
    'My details': <BookText size={16} className="text-secondary shrink-0" />,
    'My orders': <Package size={16} className="text-secondary shrink-0" />,
    'My wishlist': <Heart size={16} className="text-secondary shrink-0" />,
    'Sign out': <LogOut size={16} className="text-secondary shrink-0" />,
  };

  return icons[title as keyof typeof icons] as React.ReactNode;
};

const AccountNavigation = ({ handleClose }: { handleClose?: () => void }) => {
  const currentPathname = usePathname();

  return (
    <nav className="flex flex-col">
      {accountNav.map((link, index) => {
        const Icon = getLinkIcon(link.title);
        const isActive = currentPathname === link.url;

        return (
          <Link
            key={`${link.title}-${index + 1}`}
            href={link.url}
            className={cn(
              'flex items-center gap-3 px-4 min-h-11 text-body-sm transition-colors',
              'hover:bg-muted',
              isActive && 'bg-muted font-medium',
            )}
            onClick={() => {
              handleClose?.();
            }}
          >
            {Icon}
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default AccountNavigation;
