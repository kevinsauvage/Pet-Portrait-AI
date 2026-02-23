import Link from 'next/link';

import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

const CartEmptyState = () => {
  return (
    <Card className="border-dashed bg-card/70">
      <CardContent className="py-10 md:py-14">
        <EmptyState
          variant="cart"
          image={{
            src: '/emptyCart.svg',
            width: 200,
            height: 200,
          }}
          title="Your cart is empty"
          subtitle="Add items to your cart to get started. Browse our collections to find products you’ll love."
          altText="Empty shopping cart"
          primaryAction={
            <Button size="lg" className="min-w-[200px]" asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          }
          secondaryAction={
            <Link href="/gallery" className="link">
              Browse gallery
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CartEmptyState;
