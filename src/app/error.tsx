'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import NotFoundIllustration from '@/assets/NotFoundIllustration.png';
import config from '@/core/config';
import EmptyState from '@/ui/components/EmptyState';
import { Button } from '@/ui/components/ui/button';

const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[calc(100vh-76px)] flex items-center justify-center">
      <EmptyState
        variant="error"
        altText="Error illustration"
        image={NotFoundIllustration}
        subtitle="We encountered an error. Please try again or contact support if the problem continues."
        title="Something went wrong"
        tips={[
          'Try refreshing the page',
          'Clear your browser cache',
          'Check your internet connection',
        ]}
        primaryAction={
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        }
        secondaryAction={
          <Link href={config.routes.home} className="link">
            Go home
          </Link>
        }
      />
    </div>
  );
};

export default Error;
