'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import config from '@/core/config';
import type { AiPortraitCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { cn } from '@/lib/cn';

import { Package } from 'lucide-react';

interface CollectionsNavigationProps {
  collections: AiPortraitCollection[];
  currentCollectionHandle?: string;
}

export default function CollectionsNavigation({
  collections,
  currentCollectionHandle,
}: CollectionsNavigationProps) {
  const searchParams = useSearchParams();

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
    <nav aria-label="Collections navigation" className="space-y-1">
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
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground',
            )}
          >
            <Package className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span className="line-clamp-1">{collection.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
