'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

import { Check, Package } from 'lucide-react';

export interface SideNavItem {
  handle: string;
  title: string;
  href: string;
}

interface CollectionsSideNavProps {
  items: SideNavItem[];
  /** Path segment that directly precedes the collection handle, used to detect the active item */
  pathSegmentBeforeHandle: string;
}

export default function CollectionsSideNav({
  items,
  pathSegmentBeforeHandle,
}: CollectionsSideNavProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean);
  const segmentIndex = pathSegments.indexOf(pathSegmentBeforeHandle);
  const currentHandle =
    segmentIndex !== -1 && pathSegments[segmentIndex + 1]
      ? pathSegments[segmentIndex + 1]
      : undefined;

  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-body-sm text-muted-foreground">No collections available</p>
      </div>
    );
  }

  return (
    <nav aria-label="Collections navigation" className="space-y-1 p-2">
      {items.map((item) => {
        const isActive = item.handle === currentHandle;

        return (
          <Link
            key={item.handle}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/30" />
            )}

            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all duration-200',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground',
              )}
            >
              {isActive ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
            </div>

            <span className="line-clamp-1 flex-1">{item.title}</span>

            {isActive && (
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
