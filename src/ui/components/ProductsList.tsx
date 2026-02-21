import type { ProductFieldsFragment } from '@/modules/shopify/storefront';
import ListDisplay from '@/ui/components/ListDisplay';

import ProductCardDefault from './ProductCardDefault';

const ProductsList = ({
  products,
  layout = 'grid',
  loading,
}: {
  products: ProductFieldsFragment[];
  layout?: 'grid' | 'list';
  loading?: boolean;
}) => {
  const hasProducts = Array.isArray(products) && products.length > 0;
  return (
    hasProducts && (
      <div className="mb-12">
        <ListDisplay layout={layout} loading={loading}>
          {products.map((product, index) => (
            <ProductCardDefault product={product} key={product.id} priority={index < 5} />
          ))}
        </ListDisplay>
      </div>
    )
  );
};

export default ProductsList;
