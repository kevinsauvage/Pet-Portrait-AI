import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { isAdminAuthorized } from '@/core/utils/admin-auth';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAdminGenerationSnapshot } from '@/domains/ai/services/admin-dashboard.service';
import AdminNav from '@/ui/components/admin/AdminNav';
import { Separator } from '@/ui/primitives/separator';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin',
  description: 'Internal admin dashboard for AI portrait generations and orders.',
  url: '/admin',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  // Defense in depth: verify admin auth even though middleware protects this route
  const headersList = await headers();
  if (!isAdminAuthorized(headersList)) {
    redirect('/login');
  }

  const snapshot = getAdminGenerationSnapshot();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Portrait Admin</h1>
            <p className="text-sm text-muted-foreground">
              Internal dashboard for AI portrait generations and order handling.
            </p>
          </div>
          <AdminNav
            items={[
              { href: '/admin/overview', label: 'Overview' },
              {
                href: '/admin/generations',
                label: 'Generations',
                badge: snapshot.totalCount,
                badgeVariant: 'secondary',
              },
              { href: '/admin/orders', label: 'POD Orders' },
            ]}
          />
        </div>
      </header>
      <Separator />
      <main className="space-y-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
