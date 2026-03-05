import Link from 'next/link';

import config from '@/core/config';
import { cn } from '@/lib/utils';

import ThemeToggle from './ThemeToggle';

import { Search, User } from 'lucide-react';

const iconButtonClass = cn(
  'group cursor-pointer flex items-center justify-center h-9 w-9 rounded-xl',
  'border border-transparent text-muted-foreground',
  'transition-all duration-200',
  'hover:border-border/60 hover:bg-accent/70 hover:text-foreground',
);

const UserButtons = ({ className }: { className?: string }) => {
  return (
    <div className={cn('hidden md:flex md:items-center md:order-3 gap-0.5', className)}>
      <ThemeToggle />
      <Link aria-label="Search" className={iconButtonClass} href={config.routes.search}>
        <Search size={17} strokeWidth={1.75} />
      </Link>
      <Link aria-label="User account" className={iconButtonClass} href={config.routes.account}>
        <User size={17} strokeWidth={1.75} />
      </Link>
    </div>
  );
};

export default UserButtons;
