import Image from 'next/image';

import { Badge } from '@/ui/components/ui/badge';

type GalleryItem = {
  id: string;
  style: string;
  petType: string;
  image: string;
};

const GalleryGrid = ({ items }: { items: GalleryItem[] }) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="relative group break-inside-avoid overflow-hidden rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow"
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
          </div>
          <div className="p-4 flex items-center justify-between gap-2">
            <span className="text-body-sm font-medium">{item.petType}</span>
            <Badge variant="secondary" className="text-caption-sm">
              {item.style}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;
