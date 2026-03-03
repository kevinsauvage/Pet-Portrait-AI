'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import config from '@/core/config';
import type { AiPortraitCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { cn } from '@/lib/cn';

import { Check, Package } from 'lucide-react';

interface CollectionsNavigationProps {
  collections: AiPortraitCollection[];
}

export default function CollectionsNavigation({
  collections,
}: CollectionsNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract collection handle from pathname: /create/collections/[handle]
  const pathSegments = pathname.split('/').filter(Boolean);
  const collectionIndex = pathSegments.indexOf('collections');
  const currentCollectionHandle =
    collectionIndex !== -1 && pathSegments[collectionIndex + 1]
      ? pathSegments[collectionIndex + 1]
      : undefined;

  // Get search params from URL
  const artwork = searchParams.get('artwork') || undefined;
  const photo = searchParams.get('photo') || undefined;
  const styleId = searchParams.get('styleId') || undefined;
  const generationId = searchParams.get('generationId') || undefined;
  const urls = searchParams.get('urls') || undefined;

  if (collections.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-body-sm text-muted-foreground">No collections available</p>
      </div>
    );
  }

  return (
    <nav aria-label="Collections navigation" className="space-y-1 p-2">
      {collections.map((collection) => {
        const isActive = collection.handle === currentCollectionHandle;
        const href = `${config.routes.createCollections}/${collection.handle}${buildCreateFlowQueryString({
          artwork,
          photo,
          styleId,
          generationId,
          urls,
        })}`;

        return (
          <Link
            key={collection.handle}
            href={href}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/30" />
            )}

            {/* Icon */}
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

            {/* Title */}
            <span className="line-clamp-1 flex-1">{collection.title}</span>

            {/* Active indicator dot */}
            {isActive && (
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
