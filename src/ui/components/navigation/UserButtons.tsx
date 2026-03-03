import Link from 'next/link';

import config from '@/core/config';

import ThemeToggle from './ThemeToggle';

import { Search, User } from 'lucide-react';

const iconButtonClass =
  'group cursor-pointer flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200 text-muted-foreground hover:text-foreground';

const UserButtons = ({ className }: { className?: string }) => {
  return (
    <div className={`hidden md:flex md:items-center md:order-3 gap-0.5 ${className}`}>
      <ThemeToggle />
      <Link aria-label="Search" className={iconButtonClass} href={config.routes.search}>
        <Search size={18} strokeWidth={1.75} />
      </Link>
      <Link aria-label="User account" className={iconButtonClass} href={config.routes.account}>
        <User size={18} strokeWidth={1.75} />
      </Link>
    </div>
  );
};

export default UserButtons;
