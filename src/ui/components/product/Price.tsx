import type { MoneyV2, ProductFieldsFragment } from '@/infra/shopify/storefront';
import { formatPrice } from '@/lib/format';

const Price = ({
  compareAtPrice,
  price,
  priceRange,
}: {
  compareAtPrice: MoneyV2 | undefined | null;
  price: MoneyV2 | undefined | null;
  priceRange?: ProductFieldsFragment['priceRange'];
}) => {
  const isDiscount = compareAtPrice && compareAtPrice?.amount !== price?.amount;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {priceRange?.minVariantPrice && (
        <span className="text-body font-semibold text-foreground tabular-nums">
          {formatPrice(
            priceRange.minVariantPrice.amount,
            priceRange.minVariantPrice.currencyCode,
          )}
        </span>
      )}
      {isDiscount && compareAtPrice && (
        <span className="text-body-sm text-muted-foreground line-through tabular-nums">
          {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
        </span>
      )}
    </div>
  );
};

export default Price;
