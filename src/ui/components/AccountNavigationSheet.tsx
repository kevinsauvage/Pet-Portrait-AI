'use client';

import { useState } from 'react';

import AccountNavigation from '@/ui/components/AccountNavigation';
import { Button } from '@/ui/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet';

import { User } from 'lucide-react';

const AccountNavigationSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between">
          <span>Account Navigation</span>
          <User className="h-4 w-4 ml-2" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0"
        aria-describedby='"Account Navigation">'
      >
        <SheetHeader className="px-4 pt-6 pb-4">
          <SheetTitle className="text-heading-3">Account Navigation</SheetTitle>
          <SheetDescription className="text-body-sm text-secondary">
            Navigate through your account settings and information.
          </SheetDescription>
        </SheetHeader>
        <div className="px-0">
          <AccountNavigation handleClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default AccountNavigationSheet;
