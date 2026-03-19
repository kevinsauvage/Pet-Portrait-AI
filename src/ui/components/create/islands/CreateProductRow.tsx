'use client';

import { useState } from 'react';
import Image from 'next/image';

import type { AiPortraitProduct } from '@/domains/ai/ai-portrait/types';
import { getLowestPrice } from '@/domains/ai/ai-portrait/utils/product-utils';
import { formatPrice } from '@/lib/format';

import ProductSelectSheet from './ProductSelectSheet';

interface CreateProductRowProps {
  product: AiPortraitProduct;
  artworkUrl?: string;
  originalPhotoUrl?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
}

export default function CreateProductRow({
  product,
  artworkUrl,
  originalPhotoUrl,
  styleId,
  generationId,
  urls,
}: CreateProductRowProps) {
  const [open, setOpen] = useState(false);

  const lowestPrice = getLowestPrice(product.variants);
  const currency = product.variants[0]?.currencyCode ?? 'USD';
  const formattedPrice = formatPrice(lowestPrice, currency);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {product.image ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-heading-2">
            🖼
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-body transition-colors group-hover:text-primary">
            {product.title}
          </p>
          <p className="text-body-sm text-muted-foreground">From {formattedPrice}</p>
        </div>

        <span className="shrink-0 text-caption-sm font-medium text-primary">Select →</span>
      </button>

      <ProductSelectSheet
        product={product}
        artworkUrl={artworkUrl}
        originalPhotoUrl={originalPhotoUrl}
        styleId={styleId}
        generationId={generationId}
        urls={urls}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
