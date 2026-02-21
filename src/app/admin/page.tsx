import type { Metadata } from 'next';

import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';

import AdminDashboard from './_components/AdminDashboard';

export const metadata: Metadata = generateMetadataUtil({
  title: 'Admin | AI Pet Portrait',
  description: 'Internal admin dashboard for AI portrait generations and orders.',
  url: '/admin',
});

const AdminPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Portrait Admin</h1>
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
