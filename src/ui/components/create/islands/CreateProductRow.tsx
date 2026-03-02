'use client';

import { useState } from 'react';
import Image from 'next/image';

import type { AiPortraitProduct } from '@/domains/ai/ai-portrait/products';
import { getLowestPrice } from '@/domains/ai/ai-portrait/utils/product-utils';
import { formatPrice } from '@/lib/format';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/ui/primitives/sheet';

import AddToCartIsland from './AddToCartIsland';

interface CreateProductRowProps {
  product: AiPortraitProduct;
  artworkUrl?: string;
  originalPhotoUrl?: string;
  styleId?: string;
  generationId?: string;
}

export default function CreateProductRow({
  product,
  artworkUrl,
  originalPhotoUrl,
  styleId,
  generationId,
}: CreateProductRowProps) {
  const [open, setOpen] = useState(false);

  const lowestPrice = getLowestPrice(product.variants);
  const currency = product.variants[0]?.currencyCode ?? 'USD';
  const formattedPrice = formatPrice(lowestPrice, currency);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
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

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle>{product.title}</SheetTitle>
          {product.description && (
            <SheetDescription asChild>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {product.image && (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 448px"
              />
            </div>
          )}

          {artworkUrl && product.variants.length > 0 ? (
            <AddToCartIsland
              product={product}
              artworkUrl={artworkUrl}
              originalPhotoUrl={originalPhotoUrl}
              styleId={styleId}
              generationId={generationId}
            />
          ) : (
            <p className="text-body-sm text-muted-foreground">
              {!artworkUrl
                ? 'No artwork selected. Please go back and select an image first.'
                : 'No variants available for this product.'}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
