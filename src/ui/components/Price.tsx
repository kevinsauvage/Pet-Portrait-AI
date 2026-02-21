import type { MoneyV2, ProductFieldsFragment } from '@/modules/shopify/storefront';
import { formatPrice } from '@/utils/format';

import { Badge } from './ui/badge';

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
    <div className="flex flex-wrap items-center gap-2">
      {priceRange?.minVariantPrice && (
        <Badge variant="secondary">
          {formatPrice(priceRange.minVariantPrice.amount, priceRange.minVariantPrice.currencyCode)}
        </Badge>
      )}
      {isDiscount && compareAtPrice && (
        <p className="text-caption-sm text-muted-foreground line-through">
          {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
        </p>
      )}
    </div>
  );
};

export default Price;
