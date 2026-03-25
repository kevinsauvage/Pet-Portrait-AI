import AccountNavigation from '@/ui/components/account/AccountNavigation';
import AccountNavigationSheet from '@/ui/components/account/AccountNavigationSheet';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import PageBanner from '@/ui/components/shared/PageBanner';
import { Card, CardContent } from '@/ui/primitives/card';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative max-w-7xl pb-8 md:pb-12 mx-auto">
      <div className="relative z-10">
        <PageBanner
          title="My Account"
          description="Manage your PetPortrait AI account — view your AI creations, order history, and personal details all in one place."
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hidden md:block h-fit">
          <CardHeaderPattern
            className="mb-4 md:mb-6"
            title="Navigation"
            size={4}
            description="Your account"
          />
          <CardContent className="p-0">
            <AccountNavigation />
          </CardContent>
        </Card>
        <div className="md:hidden w-full">
          <AccountNavigationSheet />
        </div>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
