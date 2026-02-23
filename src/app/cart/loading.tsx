import Link from 'next/link';

import ProductCardSkeleton from '@/ui/components/product/ProductCardSkeleton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import PageBanner from '@/ui/components/shared/PageBanner';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';
import { Separator } from '@/ui/primitives/separator';
import { Skeleton } from '@/ui/primitives/skeleton';

import { ChevronLeft, ShoppingCart } from 'lucide-react';

const Loading = () => {
  return (
    <div className="py-10 md:py-14 max-w-7xl mx-auto px-4 md:px-6">
      <PageBanner
        eyebrow="Checkout"
        title="Your Cart"
        description="Review your order, apply discounts, and complete your purchase."
        className="w-full pb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <Link
            href="/shop"
            className="group flex items-center text-body-sm text-secondary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1 text-secondary group-hover:text-primary transition-colors" />
            Continue Shopping
          </Link>
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-secondary" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </PageBanner>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeaderPattern title="Cart Items" size={3} />
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`cart-item-${index + 1}`}>
                    <div className="relative flex flex-col gap-2 md:flex-row md:items-center">
                      <div className="flex gap-4 basis-1/2">
                        <ProductCardSkeleton variant="row" />
                      </div>
                      <div className="flex flex-row justify-between items-center gap-4 flex-1 min-w-0 md:justify-end">
                        <Skeleton className="h-10 w-24" />
                        <div className="flex flex-col items-end">
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </div>
                    {index < 2 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeaderPattern title="Order Summary" size={4} />
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeaderPattern
              title="Promo Code"
              size={4}
              description={<Skeleton className="h-4 w-full" />}
            />
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-6 w-32" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Loading;
