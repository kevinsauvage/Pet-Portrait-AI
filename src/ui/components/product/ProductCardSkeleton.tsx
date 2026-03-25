import { cn } from '@/lib/utils';
import { Skeleton } from '@/ui/primitives/skeleton';

type ProductCardSkeletonProps = {
  /**
   * Show action buttons (e.g. quick view) — typically for product grid cards
   */
  showActions?: boolean;
  /**
   * Show badge (discount/sold out) - typically for product grid cards
   */
  showBadge?: boolean;
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Layout variant - 'card' for product cards, 'row' for cart items
   */
  variant?: 'card' | 'row';
};

/**
 * Standardized product skeleton recipe:
 * - Image (aspect-square)
 * - Two text lines (title + price/subtitle)
 * - Optional badge
 * - Optional action buttons
 *
 * Used consistently across product cards, search results, and cart loading states.
 */
const ProductCardSkeleton = ({
  showActions = true,
  showBadge = false,
  className,
  variant = 'card',
}: ProductCardSkeletonProps) => {
  if (variant === 'row') {
    return (
      <div className={cn('flex gap-4', className)}>
        <div className="shrink-0">
          <Skeleton className="w-[120px] h-[120px] rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <li className={cn('relative overflow-hidden rounded-2xl border border-border bg-card', className)}>
      {showActions && (
        <div className="absolute right-3 top-3 z-20">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      )}

      <div className="relative overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        {showBadge && <Skeleton className="absolute left-3 top-3 h-5 w-12 rounded-full" />}
      </div>

      <div className="space-y-2 px-4 pb-4 pt-3.5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-1" />
      </div>
    </li>
  );
};

export default ProductCardSkeleton;
