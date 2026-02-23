'use client';

import Link from 'next/link';

import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import { Button } from '@/ui/primitives/button';

const CollectionNav = ({
  items,
  collectionSlug,
  ariaLabel = 'Collections navigation',
}: {
  items: GetMenuByHandleQuery['menu'] | null | undefined;
  collectionSlug: string;
  ariaLabel?: string;
}) => {
  const menuItems = (items?.items || []) as Array<{
    id: string;
    title: string;
    url?: string | null;
  }>;

  return (
    <div className="container mx-auto px-4 md:px-6">
      <nav aria-label={ariaLabel}>
        <ul className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {Array.isArray(menuItems) &&
            menuItems.map((menuItem) => {
              if (typeof menuItem.url !== 'string') return null;

              let href = menuItem.url;
              try {
                const parsed = new URL(menuItem.url);
                href = parsed.pathname + parsed.searchParams.toString();
              } catch {
                href = menuItem.url;
              }

              const isActive = menuItem.url
                ?.toLowerCase()
                .includes(collectionSlug?.toLowerCase());

              return (
                <li key={menuItem.id} className="shrink-0">
                  <Button variant={isActive ? 'default' : 'secondary'} size="sm" asChild>
                    <Link href={href} aria-current={isActive ? 'page' : undefined}>
                      {menuItem?.title}
                    </Link>
                  </Button>
                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );
};

export default CollectionNav;
