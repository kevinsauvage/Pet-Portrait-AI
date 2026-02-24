'use client';

import config from '@/core/config';
import { ErrorPage } from '@/ui/components/shared/ErrorPage';

const CartError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <ErrorPage
    error={error}
    reset={reset}
    logContext="cart"
    title="Unable to load cart"
    subtitle="We couldn't load your cart. Please try again or contact support if the problem continues."
    tips={['Try refreshing the page', 'Your cart items are saved', 'Contact support if the problem continues']}
    secondaryAction={{ label: 'Continue shopping', href: config.routes.home }}
  />
);

export default CartError;
