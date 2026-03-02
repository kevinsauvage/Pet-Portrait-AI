'use client';

import { useEffect, useState } from 'react';

import { useCart } from '@/contexts/CartContext/useCart';
import type {
  AiPortraitProduct,
  AiPortraitProductVariant,
} from '@/domains/ai/ai-portrait/products';
import { getFirstAvailableVariant } from '@/domains/ai/ai-portrait/utils/product-utils';
import { getStyleName } from '@/domains/ai/ai-portrait/utils/style-utils';
import { formatPrice } from '@/lib/format';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';

import { Check, Loader2, ShoppingCart } from 'lucide-react';
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
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant: AiPortraitProductVariant | undefined = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  useEffect(() => {
    setIsLoading(false);
  }, [selectedVariantId]);

  useEffect(() => {
    if (!isAdded) return;
    const timeout = setTimeout(() => setIsAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [isAdded]);

  const handleAdd = async () => {
    if (!selectedVariantId || !selectedVariant?.availableForSale || isLoading) return;

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

    setIsLoading(true);
    try {
      await handleAddToCart(selectedVariantId, 1, attributes);
      setIsAdded(true);
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
        <p className="text-heading-4">
          {formatPrice(selectedVariant.price, selectedVariant.currencyCode)}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
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
          ) : isAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
