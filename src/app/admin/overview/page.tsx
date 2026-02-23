import type { Metadata } from 'next';

import { getAdminGenerationSnapshot } from '@/domains/ai/services/admin-dashboard.service';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import AdminOverview from '@/ui/components/admin/AdminOverview';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin Overview',
  description: 'Internal admin dashboard for AI portrait generations and orders.',
  url: '/admin/overview',
  noindex: true,
});

const AdminOverviewPage = () => {
  const snapshot = getAdminGenerationSnapshot();

  return (
    <AdminOverview
      totalCount={snapshot.totalCount}
      failedCount={snapshot.failedCount}
      latestGenerations={snapshot.logs.slice(0, 5)}
    />
  );
};

export default AdminOverviewPage;
