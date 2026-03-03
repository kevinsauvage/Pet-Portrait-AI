import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import ProductCardDefault from '@/ui/components/product/ProductCardDefault';
import ListDisplay from '@/ui/components/shared/ListDisplay';

type ProductsEdgeListProps = {
  products: { node: ProductFieldsFragment; cursor: string }[];
  layout?: 'grid' | 'list';
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
  /** When provided, product links use /shop/{collectionSlug}/{handle}. Otherwise uses "all". */
  collectionSlug?: string;
};

const ProductEdgeList = ({
  products,
  layout = 'grid',
  loading,
  ariaLabel = 'Products',
  className,
  collectionSlug,
}: ProductsEdgeListProps) =>
  Array.isArray(products) && (
    <ListDisplay layout={layout} loading={loading} ariaLabel={ariaLabel} className={className}>
      {products.map((product, index) => (
        <ProductCardDefault
          product={product.node}
          key={product.cursor}
          priority={index < 5}
          collectionSlug={collectionSlug}
        />
      ))}
    </ListDisplay>
  );

export default ProductEdgeList;
