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
          subtitle="Give your pet the spotlight. Create a custom AI portrait, then pick a product to bring it to life."
          altText="Empty shopping cart"
          primaryAction={
            <Button size="lg" className="min-w-[200px]" asChild>
              <Link href="/create">Create a portrait</Link>
            </Button>
          }
          secondaryAction={
            <Link href="/gallery" className="link">
              Or explore the gallery
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CartEmptyState;
