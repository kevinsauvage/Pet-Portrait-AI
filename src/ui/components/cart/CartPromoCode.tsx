'use client';

import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';

import CouponCodeForm from './CouponCodeForm';
import DiscountCodes from './DiscountCodes';

import { Tag } from 'lucide-react';

const CartPromoCode = () => {
  return (
    <Card>
      <CardHeaderPattern
        className="pb-4 md:pb-6"
        size={4}
        title={
          <span className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-secondary" />
            Promo Code
          </span>
        }
        description="Enter a promo code to apply a discount to your order."
      />
      <CardContent>
        <CouponCodeForm />
      </CardContent>
      <CardFooter className="pt-4 md:pt-6">
        <DiscountCodes />
      </CardFooter>
    </Card>
  );
};

export default CartPromoCode;
