'use client';

import Link from 'next/link';

import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import { Button } from '@/ui/components/ui/button';

const CollectionNav = ({
  items,
  collectionSlug,
}: {
  items: GetMenuByHandleQuery['menu'] | null | undefined;
  collectionSlug: string;
}) => {
  const menuItems = (items?.items || []) as Array<{
    id: string;
    title: string;
    url?: string | null;
  }>;

  return (
    <div className="container mx-auto">
      <nav>
        <ul className="flex items-center flex-wrap gap-4">
          {Array.isArray(menuItems) &&
            menuItems.map(
              (menuItem) =>
                typeof menuItem.url === 'string' && (
                  <li key={menuItem.id}>
                    <Button
                      variant={
                        menuItem?.url?.toLowerCase().includes(collectionSlug?.toLowerCase())
                          ? 'default'
                          : 'secondary'
                      }
                      asChild
                    >
                      <Link
                        href={
                          new URL(menuItem?.url).pathname +
                          new URL(menuItem?.url).searchParams.toString()
                        }
                      >
                        {menuItem?.title}
                      </Link>
                    </Button>
                  </li>
                ),
            )}
        </ul>
      </nav>
    </div>
  );
};

export default CollectionNav;
