'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { useCart } from '@/contexts/CartContext/useCart';
import config from '@/core/config';
import type {
  AiPortraitProduct,
  AiPortraitProductVariant,
} from '@/domains/ai/ai-portrait/products';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getFirstAvailableVariant } from '@/domains/ai/ai-portrait/utils/product-utils';
import { getStyleName } from '@/domains/ai/ai-portrait/utils/style-utils';
import { api } from '@/infra/http/api-client';
import { formatPrice } from '@/lib/format';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';

import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartIslandProps {
  product: AiPortraitProduct;
  artworkUrl: string;
  originalPhotoUrl?: string;
  styleId?: string;
  generationId?: string;
}

export default function AddToCartIsland({
  product,
  artworkUrl,
  originalPhotoUrl,
  styleId,
  generationId,
}: AddToCartIslandProps) {
  const { handleAddToCart } = useCart();

  const firstAvailable = getFirstAvailableVariant(product.variants);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(firstAvailable?.id ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant: AiPortraitProductVariant | undefined = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  useEffect(() => {
    setIsLoading(false);
    setQuantity(1);
  }, [selectedVariantId]);

  const cartHref = `${config.routes.cart}${buildCreateFlowQueryString({
    artwork: artworkUrl,
    photo: originalPhotoUrl,
    styleId,
    generationId,
  })}`;

  const buildAttributes = useCallback(() => {
    const styleName = getStyleName(styleId);

    const attributes: { key: string; value: string }[] = [
      { key: 'gelato_print_url', value: artworkUrl },
      { key: 'product_handle', value: product.handle },
    ];

    if (originalPhotoUrl) attributes.push({ key: 'original_photo_url', value: originalPhotoUrl });
    if (styleName) attributes.push({ key: 'chosen_style', value: styleName });
    if (generationId) attributes.push({ key: 'generation_id', value: generationId });
    if (product.gelatoProductUid) {
      attributes.push({ key: 'gelato_product_uid', value: product.gelatoProductUid });
    }

    return attributes;
  }, [
    artworkUrl,
    generationId,
    originalPhotoUrl,
    product.gelatoProductUid,
    product.handle,
    styleId,
  ]);

  const decrementQuantity = () => {
    setQuantity((current) => (current > 1 ? current - 1 : current));
  };

  const incrementQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariantId || !selectedVariant?.availableForSale || isLoading) return;

    const attributes = buildAttributes();

    setIsLoading(true);
    try {
      await handleAddToCart(selectedVariantId, quantity, attributes);
      try {
        await api.delete('/api/create-flow');
      } catch {
        // Ignore - create flow clear is best-effort
      }
    } catch {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className="space-y-6">
      {hasMultipleVariants && (
        <div className="space-y-2">
          <Label htmlFor="variant-select">Size / Option</Label>
          <select
            id="variant-select"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-body-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
                {variant.title}
                {!variant.availableForSale ? ' (Out of stock)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedVariant && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-heading-4">
            {formatPrice(selectedVariant.price * quantity, selectedVariant.currencyCode)}
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="quantity" className="text-body-sm text-muted-foreground">
              Qty
            </Label>
            <div className="flex items-center gap-1">
              <Button
                id="quantity"
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={decrementQuantity}
                disabled={isLoading || quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-body-sm font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={incrementQuantity}
                disabled={isLoading}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={isLoading || !selectedVariant?.availableForSale}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
        <Button size="lg" variant="outline" asChild disabled={isLoading}>
          <Link href={cartHref}>View cart</Link>
        </Button>
      </div>
    </div>
  );
}
