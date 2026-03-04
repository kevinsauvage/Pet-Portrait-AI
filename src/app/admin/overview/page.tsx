import type { Metadata } from 'next';

import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import AdminOverview from '@/ui/components/admin/AdminOverview';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin Overview',
  description: 'Internal admin dashboard.',
  url: '/admin/overview',
  noindex: true,
});

const AdminOverviewPage = () => {
  return <AdminOverview />;
};

export default AdminOverviewPage;
