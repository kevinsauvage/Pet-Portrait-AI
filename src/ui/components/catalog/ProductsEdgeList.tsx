import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ProductCardDefault from '@/ui/components/product/ProductCardDefault';
import ListDisplay from '@/ui/components/shared/ListDisplay';

type ProductsEdgeListProps = {
  products: { node: ProductFieldsFragment; cursor: string }[];
  layout?: 'grid' | 'list';
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
};

const ProductEdgeList = ({
  products,
  layout = 'grid',
  loading,
  ariaLabel = 'Products',
  className,
}: ProductsEdgeListProps) =>
  Array.isArray(products) && (
    <ListDisplay layout={layout} loading={loading} ariaLabel={ariaLabel} className={className}>
      {products.map((product, index) => (
        <ProductCardDefault product={product.node} key={product.cursor} priority={index < 5} />
      ))}
    </ListDisplay>
  );

export default ProductEdgeList;
