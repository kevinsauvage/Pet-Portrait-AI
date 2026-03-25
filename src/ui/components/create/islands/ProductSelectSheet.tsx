'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import type { AiPortraitProduct } from '@/domains/ai/ai-portrait/types';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getLowestPrice } from '@/domains/ai/ai-portrait/utils/product-utils';
import { formatPrice } from '@/lib/format';
import ProductDescriptionHtml from '@/ui/components/product/ProductDescriptionHtml';
import { Button } from '@/ui/primitives/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/ui/primitives/sheet';

import { ChevronRight } from 'lucide-react';

interface ProductSelectSheetProps {
  product: AiPortraitProduct;
  artworkUrl?: string;
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductSelectSheet({
  product,
  artworkUrl,
  photo,
  styleId,
  generationId,
  urls,
  open,
  onOpenChange,
}: ProductSelectSheetProps) {
  const router = useRouter();

  const lowestPrice = getLowestPrice(product.variants);
  const currency = product.variants[0]?.currencyCode ?? 'USD';
  const formattedPrice = formatPrice(lowestPrice, currency);

  const handleSelect = () => {
    const queryString = buildCreateFlowQueryString({
      artwork: artworkUrl,
      photo,
      styleId,
      generationId,
      urls,
      productHandle: product.handle,
    });
    onOpenChange(false);
    router.push(`${config.routes.createOrder}${queryString}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle>{product.title}</SheetTitle>
          {product.description && (
            <SheetDescription asChild>
              <ProductDescriptionHtml html={product.description} />
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
            <div className="space-y-4">
              <p className="text-body-sm text-muted-foreground">
                From {formattedPrice} · {product.variants.length} option
                {product.variants.length !== 1 ? 's' : ''} available
              </p>
              <Button size="lg" onClick={handleSelect} className="w-full gap-2">
                Select & choose options
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
