'use client';

import { useState } from 'react';
import Link from 'next/link';

import config from '@/core/config';
import type { GetProductByHandleQuery } from '@/infra/shopify/generated/storefront/index';
import { formatPrice } from '@/lib/format';
import ProductDescriptionHtml from '@/ui/components/product/ProductDescriptionHtml';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Separator } from '@/ui/primitives/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';

import { Sparkles } from 'lucide-react';

type ProductDescriptionClientProps = {
  product: NonNullable<GetProductByHandleQuery['product']>;
  isModal?: boolean;
  defaultVariant: {
    price?: { amount: string; currencyCode: string } | null | undefined;
    compareAtPrice?: { amount: string; currencyCode: string } | null | undefined;
    sku?: string | null;
    title?: string;
    weight?: number | null;
    weightUnit?: string;
  };
  descriptionHtml: string;
};

const ProductDescriptionClient = ({
  product,
  isModal,
  defaultVariant,
  descriptionHtml,
}: ProductDescriptionClientProps) => {
  const [activeTab, setActiveTab] = useState('details');

  const { price, compareAtPrice, sku, title: variantTitle, weight, weightUnit } = defaultVariant;

  const hasDiscount =
    compareAtPrice && price && Number(compareAtPrice.amount) > Number(price.amount);

  return (
    <div className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {product.productType && (
            <Badge variant="outline" className="text-caption-sm">
              {product.productType}
            </Badge>
          )}
          {product.vendor && (
            <Badge variant="outline" className="text-caption-sm">
              {product.vendor}
            </Badge>
          )}
        </div>

        <h1 className="text-heading-1 font-bold">{product.title}</h1>

        {price && (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-heading-3 text-primary font-semibold">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
            {hasDiscount && compareAtPrice && (
              <span className="text-body text-muted-foreground line-through">
                {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-body-sm font-medium">
                Sale
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator />

      {!isModal && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4 space-y-4">
            {descriptionHtml ? (
              <ProductDescriptionHtml html={descriptionHtml} />
            ) : (
              <p className="text-body text-secondary">
                Experience premium quality and exceptional design with this product.
              </p>
            )}
          </TabsContent>
          <TabsContent value="specs" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
              {sku && (
                <div className="flex flex-col gap-1">
                  <span className="text-label font-medium">SKU</span>
                  <span className="text-secondary">{sku}</span>
                </div>
              )}
              {variantTitle && (
                <div className="flex flex-col gap-1">
                  <span className="text-label font-medium">Variant</span>
                  <span className="text-secondary">{variantTitle}</span>
                </div>
              )}
              {weight && (
                <div className="flex flex-col gap-1">
                  <span className="text-label font-medium">Weight</span>
                  <span className="text-secondary">{`${weight} ${weightUnit?.toLowerCase()}`}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border bg-primary/5 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-body">Personalised AI Portrait</h3>
        </div>
        <p className="text-body-sm text-muted-foreground">
          This product is made to order with your portrait. Upload your photo to start.
        </p>
        <Button className="gap-2" size="lg" asChild>
          <Link href={config.routes.create}>
            <Sparkles className="h-5 w-5" />
            Create Your Portrait
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductDescriptionClient;
