import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
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
    <section className={cn('py-10 md:py-14', className)} aria-labelledby={titleId}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6 md:mb-8">
        <div className="space-y-2">
          <SectionTitle id={titleId} className={cn('tracking-tight', titleClassName)}>
            {title}
          </SectionTitle>
          {description && (
            <p className="text-body-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
