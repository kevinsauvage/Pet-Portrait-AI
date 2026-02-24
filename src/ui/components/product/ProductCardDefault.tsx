import Link from 'next/link';

import config from '@/core/config';
import { mapShopifyImagesToImageFields } from '@/domains/products/utils/images';
import { isLowStock } from '@/domains/products/utils/inventory';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';
import OptimizedImage from '@/ui/components/media/OptimizedImage';
import { Badge } from '@/ui/primitives/badge';

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
    <Component className="group relative">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <ProductCardActions product={product} productId={id} />

        <Link
          className="flex h-full flex-col"
          href={`${config.routes.collection}/products/${handle}`}
          scroll
          aria-label={`View details for ${title}`}
        >
          <div className="relative overflow-hidden aspect-square bg-muted/40">
            <OptimizedImage
              src={primaryImage?.medium || primaryImage?.small || primaryImage?.src || ''}
              alt={primaryImage?.altText || title}
              width={520}
              height={520}
              blurDataURL={primaryImage?.blurDataURL}
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              quality={75}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />

            {compareAtPrice && price?.amount !== compareAtPrice?.amount && (
              <Badge
                variant="destructive"
                className="absolute left-2 top-2 z-10 text-body-sm font-bold px-2.5 py-1 shadow-lg backdrop-blur-sm bg-destructive/95 border-2 border-white/20"
              >
                -{isWhatPercentOf(Number(price?.amount), Number(compareAtPrice?.amount))}%
              </Badge>
            )}

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

          <div className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-4">
            <div className="space-y-1">
              <h3 className="text-heading-4 line-clamp-2 leading-snug">{title}</h3>
              <p className="text-body-sm text-muted-foreground">
                Custom pet portrait on premium paper
              </p>
            </div>
            <div>
              <Price compareAtPrice={compareAtPrice} priceRange={priceRange} price={price} />
            </div>
          </div>
        </Link>
      </article>
    </Component>
  );
};

export default ProductCardDefault;
