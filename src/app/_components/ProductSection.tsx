import Link from 'next/link';

import config from '@/core/config';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ProductsList from '@/ui/components/ProductsList';
import { Button } from '@/ui/components/ui/button';

import HomeSection from './HomeSection';

type ProductSectionProps = {
  title: string;
  products: ProductFieldsFragment[];
  viewAllLink?: string;
  viewAllLabel?: string;
  className?: string;
};

const ProductSection = ({
  title,
  products,
  viewAllLink = config.routes.collection,
  viewAllLabel = 'View all products',
  className,
}: ProductSectionProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <HomeSection
      title={title}
      className={className}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href={viewAllLink}>{viewAllLabel}</Link>
        </Button>
      }
    >
      <ProductsList products={products} layout="grid" />
    </HomeSection>
  );
};

export default ProductSection;

