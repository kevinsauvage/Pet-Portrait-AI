import { cn } from '@/lib/cn';
import { Skeleton } from '@/ui/primitives/skeleton';

type ProductCardSkeletonProps = {
  /**
   * Show action buttons (wishlist/quick view) - typically for product grid cards
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
    // Horizontal layout for cart items
    // Matches cart item structure: image (120x120) + title + subtitle
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

  // Card layout for product grid
  return (
    <li className={cn('relative overflow-hidden rounded-sm transition-all', className)}>
      {/* Action Buttons (wishlist & quick view) */}
      {showActions && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      )}

      {/* Product Image Skeleton */}
      <div className="relative overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        {/* Badge */}
        {showBadge && <Skeleton className="absolute left-2 top-2 h-6 w-12 rounded" />}
      </div>

      {/* Text Content - Two lines: title + price */}
      <div className="py-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </li>
  );
};

export default ProductCardSkeleton;
