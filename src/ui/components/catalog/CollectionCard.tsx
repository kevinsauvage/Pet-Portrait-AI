import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import type { CollectionsQuery } from '@/infra/shopify/storefront';

import { ArrowRight } from 'lucide-react';

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
      aria-label={`Shop ${title} collection`}
      className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] min-h-[220px]">
        {image?.src ? (
          <Image
            src={image.src}
            alt={image.altText || title || 'Collection image'}
            fill
            quality={85}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            blurDataURL={image?.blurDataURL}
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/85" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-heading-3 font-semibold leading-tight text-white drop-shadow-sm">
              {title}
            </h3>
            <p className="text-body-sm text-white/70">Curated portraits & premium prints</p>
          </div>
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
