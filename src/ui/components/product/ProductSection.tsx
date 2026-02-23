import Link from 'next/link';

import config from '@/core/config';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ProductsList from '@/ui/components/catalog/ProductsList';
import HomeSection from '@/ui/components/shared/HomeSection';
import { Button } from '@/ui/primitives/button';

type ProductSectionProps = {
  title: string;
  products: ProductFieldsFragment[];
  viewAllLink?: string;
  viewAllLabel?: string;
  className?: string;
  id?: string;
  description?: string;
};

const ProductSection = ({
  title,
  products,
  viewAllLink = config.routes.collection,
  viewAllLabel = 'View all products',
  className,
  id,
  description,
}: ProductSectionProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <HomeSection
      id={id}
      title={title}
      className={className}
      description={description}
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
