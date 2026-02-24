'use client';

import config from '@/core/config';
import { ErrorPage } from '@/ui/components/shared/ErrorPage';

const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <ErrorPage
    error={error}
    reset={reset}
    logContext="Application error"
    title="Something went wrong"
    subtitle="We encountered an error. Please try again or contact support if the problem continues."
    tips={['Try refreshing the page', 'Clear your browser cache', 'Check your internet connection']}
    secondaryAction={{ label: 'Go home', href: config.routes.home }}
  />
);

export default Error;
