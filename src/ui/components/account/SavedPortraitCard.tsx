'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useCart } from '@/contexts/CartContext/useCart';
import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import {
  getStyleLabel,
  getStyleName,
} from '@/domains/ai/ai-portrait/utils/style-utils';
import { removePortraitFromWishlist } from '@/domains/wishlist/client';
import type { SavedPortrait } from '@/domains/wishlist/services/wishlist.service';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';

import { Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type DefaultProduct = {
  product: { handle: string; gelatoProductUid?: string };
  variant: { id: string; availableForSale: boolean };
};

type Props = {
  portrait: SavedPortrait;
  defaultProduct?: DefaultProduct | null;
};

const SavedPortraitCard = ({ portrait, defaultProduct }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { handleAddToCart: addToCart } = useCart();
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);
  const { id, imageUrl, originalPhotoUrl, styleId, generationId, savedAt, label } = portrait;

  const styleLabel = getStyleLabel(styleId) ?? styleId;
  const date = new Date(savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const orderHref = `${config.routes.createCollections}${buildCreateFlowQueryString({
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

  const handleAddToCart = async () => {
    const variantId = portrait.variantId ?? defaultProduct?.variant.id;
    const productHandle = portrait.productHandle ?? defaultProduct?.product.handle;
    const gelatoProductUid =
      portrait.gelatoProductUid ?? defaultProduct?.product.gelatoProductUid;

    if (!variantId || !productHandle || adding) return;
    if (
      !portrait.variantId &&
      defaultProduct &&
      !defaultProduct.variant.availableForSale
    )
      return;

    const styleName = getStyleName(styleId) ?? styleId;
    const attributes: { key: string; value: string }[] = [
      { key: 'gelato_print_url', value: imageUrl },
      { key: 'product_handle', value: productHandle },
    ];
    if (originalPhotoUrl) attributes.push({ key: 'original_photo_url', value: originalPhotoUrl });
    if (styleName) attributes.push({ key: 'chosen_style', value: styleName });
    if (generationId) attributes.push({ key: 'generation_id', value: generationId });
    if (gelatoProductUid) {
      attributes.push({ key: 'gelato_product_uid', value: gelatoProductUid });
    }

    setAdding(true);
    try {
      await addToCart(variantId, 1, attributes);
      toast.success('Added to cart');
      if (pathname !== config.routes.createOrder) {
        router.push(config.routes.createOrder);
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
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
        {(portrait.variantId && portrait.productHandle) ||
        defaultProduct?.variant.availableForSale ? (
          <Button
            size="sm"
            className="w-full gap-1.5 text-xs h-8"
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ShoppingBag className="h-3 w-3" />
            )}
            Add to cart
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full gap-1.5 text-xs h-8">
            <Link href={orderHref}>
              <ShoppingBag className="h-3 w-3" />
              Choose product
            </Link>
          </Button>
        )}
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
