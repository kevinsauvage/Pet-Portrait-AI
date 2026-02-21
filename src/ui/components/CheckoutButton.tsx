import Link from 'next/link';

import { Button } from '@/ui/components/ui/button';

import { ArrowRight } from 'lucide-react';

const CheckoutButton = ({ checkoutUrl }: { checkoutUrl: string }) => {
  return (
    <Button 
      className="w-full py-6 text-body-lg font-semibold shadow-lg hover:shadow-xl transition-shadow" 
      size="lg"
      asChild
    >
      <Link href={checkoutUrl}>
        Proceed to Checkout
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
};

export default CheckoutButton;
