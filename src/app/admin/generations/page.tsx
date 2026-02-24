import type { Metadata } from 'next';

import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAdminGenerationSnapshot } from '@/domains/ai/services/admin-dashboard.service';
import AdminGenerations from '@/ui/components/admin/AdminGenerations';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin Generations',
  description: 'Internal admin dashboard for AI portrait generations and orders.',
  url: '/admin/generations',
  noindex: true,
});

const AdminGenerationsPage = () => {
  const snapshot = getAdminGenerationSnapshot();

  return (
    <AdminGenerations
      generations={snapshot.logs}
      failedCount={snapshot.failedCount}
      totalCount={snapshot.totalCount}
    />
  );
};

export default AdminGenerationsPage;
