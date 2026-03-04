import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import type { AiPortraitCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';

import { ChevronRight, Package } from 'lucide-react';

interface CollectionCardProps {
  collection: AiPortraitCollection;
  artwork?: string;
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  priority?: boolean;
}

export default function CollectionCard({
  collection,
  artwork,
  photo,
  styleId,
  generationId,
  urls,
  priority = false,
}: CollectionCardProps) {
  const href = `${config.routes.createCollections}/${collection.handle}${buildCreateFlowQueryString({
    artwork,
    photo,
    styleId,
    generationId,
    urls,
  })}`;

  return (
    <Link
      href={href}
      aria-label={`View ${collection.title} collection`}
      className="group relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Image on the left */}
      <div className="relative w-32 sm:w-40 md:w-48 shrink-0 h-32 sm:h-40 md:h-48 bg-muted/40">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.title || 'Collection image'}
            fill
            quality={85}
            priority={priority}
            sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-muted">
            <Package className="h-10 w-10 text-primary/60" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content on the right */}
      <div className="flex flex-1 flex-col justify-between p-5 md:p-6 min-w-0">
        <div className="space-y-2 flex-1">
          <h3 className="text-heading-4 font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="text-body-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <span className="inline-flex items-center gap-2 text-body-sm font-medium text-primary transition-all">
            View options
            <ChevronRight className="h-4 w-4 shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
