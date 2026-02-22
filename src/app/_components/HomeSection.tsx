import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import SectionTitle from '@/ui/components/SectionTitle';

type HomeSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  action?: ReactNode;
};

const HomeSection = ({
  title,
  children,
  className,
  titleClassName,
  action,
}: HomeSectionProps) => {
  return (
    <section className={cn('py-8 md:py-12', className)}>
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <SectionTitle className={titleClassName}>{title}</SectionTitle>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default HomeSection;

