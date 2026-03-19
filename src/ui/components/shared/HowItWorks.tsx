import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';
import { Clock } from 'lucide-react';

export type HowItWorksStep = {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
};

type HowItWorksProps = {
  title: string;
  description?: string;
  steps: readonly HowItWorksStep[];
  className?: string;
  id?: string;
  eyebrow?: string;
};

const HowItWorks = ({
  title,
  description,
  steps,
  className,
  id,
  eyebrow = 'How it works',
}: HowItWorksProps) => {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const titleId = id ? `${id}-title` : undefined;
  const gridColumns =
    steps.length >= 4
      ? 'lg:grid-cols-4'
      : steps.length === 3
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-2';

  return (
    <section className={cn('py-14 md:py-20', className)} aria-labelledby={titleId}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 space-y-3 text-center md:mb-16">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-caption-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
            </div>
          ) : null}
          <h2 id={titleId} className="text-heading-2 tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto max-w-2xl text-body-lg text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5', gridColumns)}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepNum = String(index + 1).padStart(2, '0');
            return (
              <div
                key={step.title}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] md:p-7"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <span className="text-heading-2 font-bold leading-none tracking-tighter text-border/80 transition-colors duration-300 group-hover:text-primary/20">
                    {stepNum}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-heading-4 tracking-tight">{step.title}</h3>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-caption-sm text-muted-foreground">{step.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
