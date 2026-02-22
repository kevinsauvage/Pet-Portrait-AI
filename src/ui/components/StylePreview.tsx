'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { ArtStyle } from '@/domains/ai/ai-portrait/types';
import { Button } from '@/ui/components/ui/button';

type StylePreviewProps = {
  style: ArtStyle;
  index: number;
};

const StylePreview = ({ style, index }: StylePreviewProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={style.previewImage}
          alt={`${style.label} style preview`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-5 space-y-3">
        <h3 className="text-heading-4">{style.label}</h3>
        <p className="text-body-sm text-secondary leading-relaxed line-clamp-2">
          {style.description}
        </p>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/create?style=${style.id}`}>
            Try This Style
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default StylePreview;
