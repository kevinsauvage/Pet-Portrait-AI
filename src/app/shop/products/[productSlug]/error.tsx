'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { notFoundIllustration } from '@/lib/illustrations';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';

const ProductError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logger.error('product', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[calc(100vh-76px)] flex items-center justify-center">
      <EmptyState
        variant="error"
        altText="Product error illustration"
        image={notFoundIllustration}
        subtitle="We couldn't load this product. Please try again or browse our other products."
        title="Unable to load product"
        tips={['Try refreshing the page', 'Browse similar products', 'Check back later']}
        primaryAction={
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        }
        secondaryAction={
          <Link href={config.routes.collection} className="link">
            Browse products
          </Link>
        }
      />
    </div>
  );
};

export default ProductError;
