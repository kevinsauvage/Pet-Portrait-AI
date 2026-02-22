import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Badge } from '@/ui/components/ui/badge';

type GalleryItem = {
  id: string;
  style: string;
  petType: string;
  image: string;
};

type GalleryGridProps = {
  items: GalleryItem[];
  ariaLabel?: string;
  className?: string;
};

const GalleryGrid = ({ items, ariaLabel = 'Gallery', className }: GalleryGridProps) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        'columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6',
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          className="relative group break-inside-avoid overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={item.image}
              alt={`${item.style} portrait of a ${item.petType}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="p-4 flex items-center justify-between gap-2">
            <span className="text-body-sm font-medium text-foreground">{item.petType}</span>
            <Badge variant="secondary" className="text-caption-sm">
              {item.style}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GalleryGrid;
