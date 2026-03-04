import AccountNavigation from '@/ui/components/account/AccountNavigation';
import AccountNavigationSheet from '@/ui/components/account/AccountNavigationSheet';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import PageBanner from '@/ui/components/shared/PageBanner';
import { Card, CardContent } from '@/ui/primitives/card';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl py-8 md:py-12 mx-auto">
      <PageBanner
        title="Account"
        description="Welcome to your account dashboard. Here you can view and update your personal information, manage your orders, addresses, and preferences, as well as access all your account-related settings and features."
      />
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hidden md:block h-fit">
          <CardHeaderPattern
            className="mb-4 md:mb-6"
            title="Navigation"
            size={4}
            description="Manage your account"
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
