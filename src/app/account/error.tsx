'use client';

import config from '@/core/config';
import { ErrorPage } from '@/ui/components/shared/ErrorPage';

const AccountError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <ErrorPage
    error={error}
    reset={reset}
    logContext="account"
    title="Unable to load account"
    subtitle="We couldn't load your account information. Please try again or contact support if the problem continues."
    tips={['Try refreshing the page', 'Clear your browser cache', 'Contact support if the problem continues']}
    secondaryAction={{ label: 'Go home', href: config.routes.home }}
  />
);

export default AccountError;
