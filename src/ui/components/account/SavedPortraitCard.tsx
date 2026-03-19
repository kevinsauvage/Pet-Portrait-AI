'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getStyleLabel } from '@/domains/ai/ai-portrait/utils/style-utils';
import { removePortraitFromWishlist } from '@/domains/wishlist/client';
import type { SavedPortrait } from '@/domains/wishlist/types';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';

import { Loader2, ShoppingBag, Trash2 } from 'lucide-react';

type DefaultProduct = {
  product: { handle: string };
  variant: { id: string; availableForSale: boolean };
};

type Props = {
  portrait: SavedPortrait;
  defaultProduct?: DefaultProduct | null;
};

const SavedPortraitCard = ({ portrait, defaultProduct }: Props) => {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const { id, imageUrl, originalPhotoUrl, styleId, generationId, savedAt, label } = portrait;

  const styleLabel = getStyleLabel(styleId) ?? styleId;
  const date = new Date(savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const productHandle = portrait.productHandle ?? defaultProduct?.product.handle;
  const canSelect = productHandle && (portrait.variantId || defaultProduct?.variant.availableForSale);

  const selectHref = canSelect
    ? `${config.routes.createOrder}${buildCreateFlowQueryString({
        artwork: imageUrl,
        photo: originalPhotoUrl,
        styleId,
        generationId,
        productHandle,
      })}`
    : `${config.routes.createCollections}${buildCreateFlowQueryString({
        artwork: imageUrl,
        photo: originalPhotoUrl,
        styleId,
        generationId,
      })}`;

  const handleRemove = async () => {
    setRemoving(true);
    await removePortraitFromWishlist(id);
    router.refresh();
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={label ?? `${styleLabel} portrait`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>

      <CardContent className="px-2 pt-2 pb-1.5 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <Badge variant="outline" className="text-caption-sm px-1.5 py-0">
            {styleLabel}
          </Badge>
          <span className="text-caption-xs text-muted-foreground">{date}</span>
        </div>
        {label && <p className="text-body-xs font-medium mt-1 truncate">{label}</p>}
      </CardContent>

      <CardFooter className="px-2 pb-2 gap-1.5 flex-col">
        <Button asChild size="sm" className="w-full gap-1.5 text-xs h-8">
          <Link href={selectHref}>
            <ShoppingBag className="h-3 w-3" />
            {canSelect ? 'Select & add to cart' : 'Choose product'}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs h-8"
          onClick={handleRemove}
          disabled={removing}
        >
          {removing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavedPortraitCard;
