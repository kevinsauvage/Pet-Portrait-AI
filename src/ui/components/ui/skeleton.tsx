import { cn } from '@/utils/cn';

const Skeleton = ({ className, ...properties }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...properties}
    />
  );
};

export { Skeleton };
