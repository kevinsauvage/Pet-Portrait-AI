import Link from 'next/link';

import config from '@/core/config';

import ThemeToggle from './ThemeToggle';

import { Search, User } from 'lucide-react';

const UserButtons = ({ className }: { className?: string }) => {
  return (
    <div className={`hidden md:flex md:items-center md:order-3 gap-1.5 lg:gap-2 ${className}`}>
      <ThemeToggle />
      <Link
        aria-label="Search"
        className="group cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        href={config.routes.search}
      >
        <Search
          size={20}
          strokeWidth={1.5}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>

      <Link
        aria-label={'User account'}
        className="group cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        href={config.routes.account}
      >
        <User
          size={20}
          strokeWidth={1.5}
          className="hidden md:block text-secondary group-hover:text-primary transition-colors"
        />
      </Link>
    </div>
  );
};

export default UserButtons;
