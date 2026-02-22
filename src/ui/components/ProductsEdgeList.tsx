import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ListDisplay from '@/ui/components/ListDisplay';

import ProductCardDefault from './ProductCardDefault';

const ProductEdgeList = ({
  products,
  layout = 'grid',
  loading,
}: {
  products: { node: ProductFieldsFragment; cursor: string }[];
  layout?: 'grid' | 'list';
  loading?: boolean;
}) =>
  Array.isArray(products) && (
    <div className="mb-12">
      <ListDisplay layout={layout} loading={loading}>
        {products.map((product, index) => (
          <ProductCardDefault product={product.node} key={product.cursor} priority={index < 5} />
        ))}
      </ListDisplay>
    </div>
  );

export default ProductEdgeList;
