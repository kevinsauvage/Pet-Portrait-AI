import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Button } from '@/ui/primitives/button';

type PageBannerProps = {
  title: string;
  description?: string;
  eyebrow?: string;
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
  eyebrow,
  children,
  className,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: PageBannerProps) => (
  <section
    aria-labelledby="page-banner-title"
    className={cn(
      'relative isolate overflow-hidden bg-linear-to-b from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20',
      className,
    )}
  >
    <div className="container mx-auto flex flex-col items-center justify-center text-center px-4 md:px-6 py-16 md:py-24 lg:py-32 relative">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(194,65,12,0.04)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.06)_0%,transparent_50%)] pointer-events-none"
        aria-hidden
      />
      <div className="relative max-w-4xl space-y-6 md:space-y-7">
        {eyebrow && (
          <p className="text-caption-sm uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1
          id="page-banner-title"
          className="text-display md:text-[3.75rem] md:leading-[1.1] font-semibold tracking-tight"
        >
          {title}
        </h1>
        {description && (
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {(ctaLabel || secondaryCtaLabel) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {ctaLabel && ctaHref && (
              <Button
                size="lg"
                asChild
                className="text-base px-8 py-6 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Link href={ctaHref} aria-label={ctaLabel}>
                  {ctaLabel}
                </Link>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-base px-8 py-6 border-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                <Link href={secondaryCtaHref} aria-label={secondaryCtaLabel}>
                  {secondaryCtaLabel}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      {children && <div className="mt-10 w-full max-w-5xl">{children}</div>}
    </div>
  </section>
);

export default PageBanner;
