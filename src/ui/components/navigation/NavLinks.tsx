'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

import type { NavLink } from './nav-links-utils';

type NavLinksProps = {
  links: NavLink[];
  className?: string;
  linkClassName?: string;
};

const NavLinks = ({ links, className, linkClassName }: NavLinksProps) => {
  const pathname = usePathname();
  if (!links.length) return null;

  return (
    <nav className={className} aria-label="Main navigation">
      <ul className="flex items-center gap-0.5 list-none p-0 m-0">
        {links.map((link) => {
          const isActive =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  linkClassName ??
                  cn(
                    'relative px-3.5 py-2 text-body-sm font-medium transition-colors duration-150 rounded-lg',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/70',
                  )
                }
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[9px] h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavLinks;
