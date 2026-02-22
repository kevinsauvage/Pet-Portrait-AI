import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import type { CollectionsQuery } from '@/infra/shopify/storefront';

import { Button } from './ui/button';

const CollectionCard = ({
  collection,
  priority = false,
}: {
  collection: CollectionsQuery['collections']['edges'][number]['node'];
  priority?: boolean;
}) => {
  const { title, image, handle } = collection || {};

  return (
    <div className="relative group overflow-hidden transition-all w-full h-full min-h-[300px] rounded-lg">
      {image?.src && (
        <Image
          src={image.src}
          alt={image.altText || title || 'Collection image'}
          fill
          quality={80}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          blurDataURL={image?.blurDataURL}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent flex flex-col gap-3 items-center justify-end text-center p-6 group-hover:from-black/80 transition-all">
        <h3 className="text-heading-3 text-white drop-shadow-lg">{title}</h3>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`${config.routes.collection}/${handle}`}>
            Shop Now
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CollectionCard;
