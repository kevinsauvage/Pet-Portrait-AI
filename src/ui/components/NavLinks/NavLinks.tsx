import Link from 'next/link';

import type { NavLink } from './nav-links-utils';

type NavLinksProps = {
  links: NavLink[];
  className?: string;
  linkClassName?: string;
};

const NavLinks = ({ links, className, linkClassName }: NavLinksProps) => {
  if (!links.length) return null;

  return (
    <nav className={className} aria-label="Main navigation">
      <ul className="flex items-center gap-1 list-none p-0 m-0">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className={
                linkClassName ??
                'px-3 py-2 text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent'
              }
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
