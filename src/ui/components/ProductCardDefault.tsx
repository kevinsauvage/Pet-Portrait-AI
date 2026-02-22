import Link from 'next/link';

import config from '@/core/config';
import { isLowStock } from '@/domains/products/utils/inventory';
import { mapShopifyImagesToImageFields } from '@/infra/shopify/images';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

import { Badge } from './ui/badge';
import OptimizedImage from './OptimizedImage';
import Price from './Price';
import ProductCardActions from './ProductCardActions';

const isWhatPercentOf = (x: number, y: number) => (((x - y) / y) * 100).toFixed(0);

type ProductCardDefaultProps = {
  product: ProductFieldsFragment;
  priority: boolean;
  asListItem?: boolean;
};

const ProductCardDefault = ({ product, priority, asListItem = true }: ProductCardDefaultProps) => {
  const { title, images, handle, variants, id, priceRange } = product;
  const { price, compareAtPrice, availableForSale, quantityAvailable } =
    variants?.edges?.[0]?.node || {};

  const productImages = mapShopifyImagesToImageFields(images?.edges);
  const primaryImage = productImages?.[0];

  const lowStock = isLowStock(quantityAvailable) && availableForSale;
  const isSoldOut = !availableForSale;

  const Component = asListItem ? 'li' : 'div';

  return (
    <Component className="relative group overflow-hidden rounded-sm transition-all hover:shadow-lg">
      <ProductCardActions product={product} productId={id} />

      <Link
        className="block cursor-pointer"
        href={`${config.routes.collection}/products/${handle}`}
        scroll
      >
        <div className="relative overflow-hidden aspect-square">
          <OptimizedImage
            src={primaryImage?.medium || primaryImage?.small || primaryImage?.src || ''}
            alt={primaryImage?.altText || title}
            width={500}
            height={500}
            blurDataURL={primaryImage?.blurDataURL}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            quality={75}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            aria-label={`Image of ${title}`}
          />

          {/* Discount Badge */}
          {compareAtPrice && price?.amount !== compareAtPrice?.amount && (
            <Badge
              variant="destructive"
              className="absolute left-2 top-2 z-10 text-body-sm font-bold px-2.5 py-1 shadow-lg backdrop-blur-sm bg-destructive/95 border-2 border-white/20"
            >
              -{isWhatPercentOf(Number(price?.amount), Number(compareAtPrice?.amount))}%
            </Badge>
          )}

          {/* Availability Indicators */}
          {isSoldOut && (
            <Badge
              variant="destructive"
              className="absolute right-2 top-2 z-10 text-body-sm font-bold px-2.5 py-1 shadow-lg backdrop-blur-sm bg-destructive/95 border-2 border-white/20"
            >
              Sold Out
            </Badge>
          )}
          {lowStock && !isSoldOut && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 z-10 text-body-sm font-bold px-2.5 py-1 shadow-lg backdrop-blur-sm bg-secondary/95 border-2 border-white/20"
            >
              Low Stock
            </Badge>
          )}
        </div>

        <div className="py-4">
          <h3 className="text-heading-4 mb-2 line-clamp-2">{title}</h3>
          <div>
            <Price compareAtPrice={compareAtPrice} priceRange={priceRange} price={price} />
          </div>
        </div>
      </Link>
    </Component>
  );
};

export default ProductCardDefault;
