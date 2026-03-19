'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCart } from '@/contexts/CartContext/useCart';
import config from '@/core/config';
import type {
  AiPortraitProduct,
  AiPortraitProductVariant,
} from '@/domains/ai/ai-portrait/products';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getFirstAvailableVariant } from '@/domains/ai/ai-portrait/utils/product-utils';
import { getStyleName } from '@/domains/ai/ai-portrait/utils/style-utils';
import { getPreviewRequestKey } from '@/domains/printful/utils';
import { api } from '@/infra/http/api-client';
import { fetchPrintfulPreview } from '@/infra/printful/preview-client';
import { formatPrice } from '@/lib/format';
import ProductPortraitPreview from '@/ui/components/create/ProductPortraitPreview';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';

import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const PREVIEW_ERROR_MESSAGE = 'Preview generation failed. Please try again.';

interface AddToCartIslandProps {
  product: AiPortraitProduct;
  artworkUrl: string;
  originalPhotoUrl?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  /** Initial preview URL from server or URL params */
  initialPreviewUrl?: string | null;
  /** Shopify variant ID the initial preview was generated for (skip fetch when matching) */
  initialPreviewVariantId?: string;
}

export default function AddToCartIsland({
  product,
  artworkUrl,
  originalPhotoUrl,
  styleId,
  generationId,
  urls,
  initialPreviewUrl,
  initialPreviewVariantId,
}: AddToCartIslandProps) {
  const { handleAddToCart } = useCart();
  const router = useRouter();

  const firstAvailable = getFirstAvailableVariant(product.variants);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(firstAvailable?.id ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const lastPreviewRequestRef = useRef<string>('');
  const isInitialVariantMount = useRef(true);

  const selectedVariant: AiPortraitProductVariant | undefined = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  useEffect(() => {
    setIsLoading(false);
    setQuantity(1);
    lastPreviewRequestRef.current = '';
    if (isInitialVariantMount.current) {
      isInitialVariantMount.current = false;
    } else {
      setPreviewUrl(null);
      setPreviewError(null);
    }
  }, [selectedVariantId]);

  const updateUrlWithPreview = useCallback(
    (newPreviewUrl: string | null) => {
      const params = buildCreateFlowQueryString({
        artwork: artworkUrl,
        photo: originalPhotoUrl,
        styleId,
        generationId,
        urls,
        productHandle: product.handle,
        previewUrl: newPreviewUrl ?? undefined,
      });
      router.replace(`${config.routes.createOrder}${params}`, { scroll: false });
    },
    [artworkUrl, generationId, originalPhotoUrl, product.handle, router, styleId, urls],
  );

  useEffect(() => {
    const printfulVariantId = selectedVariant?.printfulVariantId;
    if (!printfulVariantId || !artworkUrl || !selectedVariant) return;

    if (
      initialPreviewVariantId &&
      selectedVariantId === initialPreviewVariantId &&
      initialPreviewUrl
    ) {
      setPreviewUrl(initialPreviewUrl);
      setPreviewError(null);
      return;
    }

    const requestKey = getPreviewRequestKey(printfulVariantId, artworkUrl);
    if (lastPreviewRequestRef.current === requestKey) return;

    const generatePreviewTask = async () => {
      lastPreviewRequestRef.current = requestKey;
      setIsGeneratingPreview(true);
      setPreviewError(null);
      try {
        const { previewUrl: newPreviewUrl } = await fetchPrintfulPreview({
          variantId: printfulVariantId,
          artworkUrl,
        });

        if (newPreviewUrl) {
          setPreviewUrl(newPreviewUrl);
          setPreviewError(null);
          updateUrlWithPreview(newPreviewUrl);
        } else {
          setPreviewUrl(null);
          setPreviewError(PREVIEW_ERROR_MESSAGE);
        }
      } catch (error) {
        console.error('Preview generation failed:', error);
        setPreviewUrl(null);
        setPreviewError(PREVIEW_ERROR_MESSAGE);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    generatePreviewTask();
  }, [
    artworkUrl,
    initialPreviewUrl,
    initialPreviewVariantId,
    selectedVariant,
    selectedVariantId,
    updateUrlWithPreview,
  ]);

  const cartHref = `${config.routes.cart}${buildCreateFlowQueryString({
    artwork: artworkUrl,
    photo: originalPhotoUrl,
    styleId,
    generationId,
  })}`;

  const buildAttributes = useCallback(() => {
    const styleName = getStyleName(styleId);

    const attributes: { key: string; value: string }[] = [
      { key: 'printful_print_url', value: artworkUrl },
      { key: 'product_handle', value: product.handle },
    ];

    if (previewUrl) {
      attributes.push({ key: 'printful_preview_url', value: previewUrl });
    }
    if (originalPhotoUrl) attributes.push({ key: 'original_photo_url', value: originalPhotoUrl });
    if (styleName) attributes.push({ key: 'chosen_style', value: styleName });
    if (generationId) attributes.push({ key: 'generation_id', value: generationId });

    return attributes;
  }, [artworkUrl, generationId, originalPhotoUrl, previewUrl, product.handle, styleId]);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProductPortraitPreview
          previewUrl={previewUrl}
          product={product}
          isLoading={isGeneratingPreview}
          error={previewError}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-6">
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
      </div>
    </div>
  );
}
