import Link from 'next/link';

import { cn } from '@/lib/utils';
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
    className={cn('relative isolate overflow-hidden', className)}
  >
    <div className="container relative mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
      <div className="relative max-w-4xl space-y-5 md:space-y-7">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-caption-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          </div>
        )}
        <h1
          id="page-banner-title"
          className="text-display font-bold tracking-tight md:text-display-lg"
        >
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-2xl text-body-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {(ctaLabel || secondaryCtaLabel) && (
          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            {ctaLabel && ctaHref && (
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-body font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                </Link>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 border-border/70 px-8 text-body font-medium transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
              >
                <Link href={secondaryCtaHref}>
                  {secondaryCtaLabel}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      {children && <div className="mt-12 w-full max-w-5xl flex justify-center">{children}</div>}
    </div>
  </section>
);

export default PageBanner;
