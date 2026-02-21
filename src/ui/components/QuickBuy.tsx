'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

import type { ProductFieldsFragment } from '@/modules/shopify/storefront';

import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import SpinnerLoader from './SpinnerLoader';

import { Eye } from 'lucide-react';

// Only load QuickBuyContent when sheet is opened
const QuickBuyContent = dynamic(() => import('./QuickBuyContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <SpinnerLoader />
    </div>
  ),
});

type QuickBuyProps = {
  product: ProductFieldsFragment;
};

const QuickBuy = ({ product }: QuickBuyProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur-sm text-secondary transition-all duration-200 hover:bg-muted hover:scale-110 shadow-md"
          type="button"
          aria-label="Quick view"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full gap-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Quick view</SheetTitle>
        </SheetHeader>
        {isOpen && <QuickBuyContent product={product} onClose={handleClose} />}
      </SheetContent>
    </Sheet>
  );
};

export default QuickBuy;
