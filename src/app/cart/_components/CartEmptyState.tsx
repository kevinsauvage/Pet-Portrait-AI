import Link from 'next/link';

import EmptyState from '@/ui/components/EmptyState';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';

const CartEmptyState = () => {
  return (
    <Card>
      <CardContent className="py-8 md:py-12">
        <EmptyState
          variant="cart"
          image={{
            src: '/emptyCart.svg',
            width: 200,
            height: 200,
          }}
          title="Your cart is empty"
          subtitle="Add items to your cart to get started. Browse our collections to find products you'll love."
          altText="Empty shopping cart"
          primaryAction={
            <Link href="/">
              <Button size="lg" className="min-w-[200px]">
                Start Shopping
              </Button>
            </Link>
          }
          secondaryAction={
            <Link href="/collections" className="link">
              Browse collections
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CartEmptyState;

