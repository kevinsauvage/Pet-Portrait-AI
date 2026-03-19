import { mapShopifyImagesToImageFields } from '@/domains/products/images';
import type { GetProductByHandleQuery } from '@/infra/shopify/generated/storefront/index';
import { cn } from '@/lib/utils';
import PhotoGallery from '@/ui/components/media/PhotoGallery';

import ProductDescriptionClient from './ProductDescriptionClient';

type ProductDescriptionProps = {
  product: GetProductByHandleQuery['product'];
  isModal?: boolean;
  className?: string;
};

const ProductDescription = ({ product, isModal, className }: ProductDescriptionProps) => {
  if (!product) return null;

  const descriptionHtml: string =
    typeof product.descriptionHtml === 'string' ? product.descriptionHtml : '';

  const firstVariant = product.variants?.edges?.[0]?.node;
  const defaultVariant = {
    price: firstVariant?.price,
    compareAtPrice: firstVariant?.compareAtPrice,
    sku: firstVariant?.sku ?? null,
    title: firstVariant?.title,
    weight: firstVariant?.weight ?? null,
    weightUnit: firstVariant?.weightUnit,
  };

  const productImages = mapShopifyImagesToImageFields(product.images?.edges);

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 relative',
        className,
      )}
    >
      <div className="lg:col-span-7">
        <PhotoGallery images={productImages} />
      </div>

      <ProductDescriptionClient
        product={product}
        isModal={isModal}
        defaultVariant={defaultVariant}
        descriptionHtml={descriptionHtml}
      />
    </div>
  );
};

export default ProductDescription;
