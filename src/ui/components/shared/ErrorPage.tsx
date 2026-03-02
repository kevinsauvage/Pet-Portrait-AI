'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { logger } from '@/core/utils/logger';
import type { IllustrationImage } from '@/lib/illustrations';
import { notFoundIllustration } from '@/lib/illustrations';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';

export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Log context for Sentry/debugging */
  logContext: string;
  title: string;
  subtitle: string;
  tips: string[];
  primaryActionLabel?: string;
  secondaryAction: {
    label: string;
    href: string;
  };
  /** Illustration for EmptyState */
  image?: IllustrationImage;
  altText?: string;
};

/**
 * Reusable error boundary page for route segments.
 * Ensures consistent error UX and logging across app, cart, account, product, etc.
 */
export function ErrorPage({
  error,
  reset,
  logContext,
  title,
  subtitle,
  tips,
  primaryActionLabel = 'Try again',
  secondaryAction,
  image = notFoundIllustration,
  altText = 'Error illustration',
}: ErrorPageProps) {
  useEffect(() => {
    logger.error('Error occurred', { context: logContext, error });
  }, [error, logContext]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[calc(100vh-76px)] flex items-center justify-center">
      <EmptyState
        variant="error"
        altText={altText}
        image={image}
        subtitle={subtitle}
        title={title}
        tips={tips}
        primaryAction={
          <Button onClick={reset} variant="default">
            {primaryActionLabel}
          </Button>
        }
        secondaryAction={
          <Link href={secondaryAction.href} className="link">
            {secondaryAction.label}
          </Link>
        }
      />
    </div>
  );
}
