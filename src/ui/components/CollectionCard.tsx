import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import type { CollectionsQuery } from '@/infra/shopify/storefront';

import { ChevronRight } from 'lucide-react';

const CollectionCard = ({
  collection,
  priority = false,
}: {
  collection: CollectionsQuery['collections']['edges'][number]['node'];
  priority?: boolean;
}) => {
  const { title, image, handle } = collection || {};

  return (
    <Link
      href={`${config.routes.collection}/${handle}`}
      className="group relative block overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-4/3 min-h-[240px]">
        {image?.src ? (
          <Image
            src={image.src}
            alt={image.altText || title || 'Collection image'}
            fill
            quality={85}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            blurDataURL={image?.blurDataURL}
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:from-black/90 transition-colors duration-300" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-heading-3 text-white drop-shadow-md font-semibold">{title}</h3>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/95 group-hover:text-white group-hover:gap-2 transition-all">
          Shop collection
          <ChevronRight className="h-4 w-4 shrink-0" />
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard;
