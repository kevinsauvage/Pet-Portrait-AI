import { cn } from '@/lib/cn';

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
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  const titleId = id ? `${id}-title` : undefined;
  const gridColumns =
    steps.length >= 4 ? 'lg:grid-cols-4' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section className={cn('py-12 md:py-16', className)} aria-labelledby={titleId}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-14 space-y-3">
          {eyebrow ? (
            <p className="text-caption-sm uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 id={titleId} className="text-heading-2 tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-body-lg text-secondary max-w-2xl mx-auto">{description}</p>
          ) : null}
        </div>
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8', gridColumns)}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={`${step.title}-${index}`}
                className="group flex flex-col items-start text-left space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-caption-sm text-primary font-semibold">Step {index + 1}</p>
                  <h3 className="text-heading-4 tracking-tight">{step.title}</h3>
                  <p className="text-body-sm text-secondary leading-relaxed">{step.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-caption-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Typical time: {step.time}</span>
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
