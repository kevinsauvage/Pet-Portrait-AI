import Link from 'next/link';

import { cn } from '@/lib/cn';

import { Button } from './ui/button';

type PageBannerProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

const PageBanner = ({
  title,
  description,
  children,
  className,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: PageBannerProps) => (
  <div
    className={cn(
      'relative overflow-hidden',
      'bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50',
      'dark:from-amber-950/30 dark:via-background dark:to-background',
      className,
    )}
  >
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }} />
    <div className="container mx-auto flex flex-col items-center justify-center text-center py-16 md:py-24 lg:py-32 px-4 md:px-6 space-y-6 md:space-y-8 relative">
      <h1 className="text-display md:text-[3.5rem] md:leading-16 max-w-4xl">{title}</h1>
      {description && (
        <p className="text-body-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {(ctaLabel || secondaryCtaLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {ctaLabel && ctaHref && (
            <Button size="lg" asChild className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
          {secondaryCtaLabel && secondaryCtaHref && (
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-6">
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  </div>
);

export default PageBanner;
