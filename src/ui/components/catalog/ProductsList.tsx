import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ProductCardDefault from '@/ui/components/product/ProductCardDefault';
import ListDisplay from '@/ui/components/shared/ListDisplay';

type ProductsListProps = {
  products: ProductFieldsFragment[];
  layout?: 'grid' | 'list';
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
};

const ProductsList = ({
  products,
  layout = 'grid',
  loading,
  ariaLabel = 'Products',
  className,
}: ProductsListProps) => {
  const hasProducts = Array.isArray(products) && products.length > 0;
  if (!hasProducts && !loading) {
    return null;
  }

  return (
    <ListDisplay layout={layout} loading={loading} ariaLabel={ariaLabel} className={className}>
      {products.map((product, index) => (
        <ProductCardDefault product={product} key={product.id} priority={index < 5} />
      ))}
    </ListDisplay>
  );
};

export default ProductsList;
