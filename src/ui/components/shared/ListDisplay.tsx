import { cn } from '@/lib/cn';
import ProductCardSkeleton from '@/ui/components/product/ProductCardSkeleton';

type ListDisplayProps = {
  children: React.ReactNode;
  layout?: 'grid' | 'list';
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
};

const ListDisplay = ({
  children,
  layout = 'grid',
  loading = false,
  ariaLabel,
  className,
}: ListDisplayProps) => {
  return (
    <ul
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-live={loading ? 'polite' : undefined}
      data-layout={layout}
      className={cn(
        'gap-4 md:gap-6 lg:gap-8',
        layout === 'grid'
          ? 'grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4'
          : 'flex flex-col',
        className,
      )}
    >
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-product-${index + 1}`} />
          ))
        : children}
    </ul>
  );
};

export default ListDisplay;
