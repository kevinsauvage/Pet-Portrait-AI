import type { Metadata } from 'next';

import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import AdminOrders from '@/ui/components/admin/AdminOrders';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin Orders',
  description: 'Internal admin dashboard for AI portrait generations and orders.',
  url: '/admin/orders',
  noindex: true,
});

const AdminOrdersPage = () => {
  return <AdminOrders />;
};

export default AdminOrdersPage;
