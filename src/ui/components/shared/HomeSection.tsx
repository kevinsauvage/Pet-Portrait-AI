import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import SectionTitle from '@/ui/components/shared/SectionTitle';

type HomeSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  action?: ReactNode;
  id?: string;
  description?: string;
};

const HomeSection = ({
  title,
  children,
  className,
  titleClassName,
  action,
  id,
  description,
}: HomeSectionProps) => {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <section className={cn(className)} aria-labelledby={titleId}>
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <SectionTitle id={titleId} className={cn('tracking-tight', titleClassName)}>
            {title}
          </SectionTitle>
          {description && (
            <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
