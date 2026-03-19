'use client';

import Image from 'next/image';

import type { AiPortraitProduct } from '@/domains/ai/ai-portrait/types';

interface ProductPortraitPreviewProps {
  previewUrl: string | null;
  product: AiPortraitProduct;
  isLoading?: boolean;
  /** Shown when preview generation failed */
  error?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 200, height: 200 },
  md: { width: 400, height: 400 },
  lg: { width: 600, height: 600 },
  xl: { width: 800, height: 800 },
};

export default function ProductPortraitPreview({
  previewUrl,
  product,
  isLoading = false,
  error,
  size = 'md',
  className,
}: ProductPortraitPreviewProps) {
  const dimensions = sizeMap[size];

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-destructive/10 text-destructive ${className ?? ''}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <span className="text-body-sm font-medium">{error}</span>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-muted text-muted-foreground ${className ?? ''}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <span className="text-body-sm">No preview</span>
      </div>
    );
  }

  return (
    <Image
      src={previewUrl}
      alt={`${product.title} with your portrait`}
      width={dimensions.width}
      height={dimensions.height}
      className={`rounded-lg object-cover ${className ?? ''}`}
    />
  );
}
