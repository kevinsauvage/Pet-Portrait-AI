'use client';

import { usePathname } from 'next/navigation';

import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';

type CollectionLayoutContentProps = {
  collectionTitle?: string;
  collectionDescription?: string;
  children: React.ReactNode;
};

/**
 * Conditionally shows collection header only on collection pages (not product pages).
 * Product pages have their own H1 and breadcrumbs.
 */
const CollectionLayoutContent = ({
  collectionTitle,
  collectionDescription,
  children,
}: CollectionLayoutContentProps) => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isProductPage = segments.length >= 3 && segments[0] === 'shop';

  return (
    <div className="space-y-6">
      {!isProductPage && <Breadcrumbs />}

      {!isProductPage && collectionTitle && (
        <div className="space-y-1">
          <h1 className="text-heading-2 font-semibold tracking-tight">{collectionTitle}</h1>
          {collectionDescription && (
            <p className="text-body-sm text-muted-foreground max-w-2xl">
              {collectionDescription}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default CollectionLayoutContent;
