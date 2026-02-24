'use client';

import config from '@/core/config';
import { ErrorPage } from '@/ui/components/shared/ErrorPage';

const ProductError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <ErrorPage
    error={error}
    reset={reset}
    logContext="product"
    title="Unable to load product"
    subtitle="We couldn't load this product. Please try again or browse our other products."
    tips={['Try refreshing the page', 'Browse similar products', 'Check back later']}
    secondaryAction={{ label: 'Browse products', href: config.routes.collection }}
  />
);

export default ProductError;
