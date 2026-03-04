'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { notFoundIllustration } from '@/lib/illustrations';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';

/**
 * Error boundary for the create flow.
 * Catches errors in any step (upload, style, generating, select, collections, order)
 * and provides recovery options with "Start over" and "Go home" actions.
 */
const CreateError = ({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logger.error('Error occurred in create flow', {
      context: 'Create flow error',
      error,
      metadata: {
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[calc(100vh-76px)] flex items-center justify-center">
      <EmptyState
        variant="error"
        altText="Error illustration"
        image={notFoundIllustration}
        subtitle="We encountered an error while creating your portrait. Don't worry—your progress hasn't been lost. You can start over or return home."
        title="Something went wrong"
        tips={[
          'Try starting over from the beginning',
          'Check your internet connection',
          'Make sure your photo meets the requirements',
          'If the problem persists, contact support',
        ]}
        primaryAction={
          <Button asChild variant="default">
            <Link href={config.routes.create}>Start over</Link>
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

export default CreateError;
