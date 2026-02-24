'use client';

import { useState } from 'react';

import useUserContext from '@/contexts/UserContext/useUserContext';
import { logger } from '@/core/utils/logger';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import SpinnerLoader from '@/ui/components/shared/SpinnerLoader';
import { Button } from '@/ui/primitives/button';

import QuickBuy from './QuickBuy';

import { Heart } from 'lucide-react';

type ProductCardActionsProps = {
  product: ProductFieldsFragment;
  productId: string;
};

const ProductCardActions = ({ product, productId }: ProductCardActionsProps) => {
  const { userWishlist, handleSetWishlist } = useUserContext();
  const [loading, setLoading] = useState(false);

  const isWishlisted = userWishlist?.find((item) => item.id === productId);

  const handleWishlist = async () => {
    setLoading(true);
    try {
      await handleSetWishlist(!!isWishlisted, product);
    } catch (error) {
      logger.error('wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-2 right-2 z-20 flex flex-col gap-2.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
      <Button
        variant="ghost"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        disabled={loading}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur-sm text-secondary transition-all duration-200 hover:bg-muted hover:scale-110 shadow-md ${
          isWishlisted ? 'text-destructive' : ''
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.stopPropagation();
          event.preventDefault();
          handleWishlist();
        }}
      >
        {loading ? (
          <SpinnerLoader size="sm" />
        ) : (
          <Heart color="currentColor" className={isWishlisted ? 'fill-destructive' : ''} />
        )}
      </Button>

      <QuickBuy product={product} />
    </div>
  );
};

export default ProductCardActions;
