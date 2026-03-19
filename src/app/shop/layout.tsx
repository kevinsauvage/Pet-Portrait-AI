import type { ReactNode } from 'react';

import { getAllCollections } from '@/domains/collections/collections.service';
import CollectionsSideNav from '@/ui/components/catalog/CollectionsSideNav';
import { Card, CardContent, CardHeader } from '@/ui/primitives/card';

import { Package } from 'lucide-react';

interface ShopLayoutProps {
  children: ReactNode;
}

export default async function ShopLayout({ children }: ShopLayoutProps) {
  const collections = await getAllCollections();

  const items = collections.map((edge) => ({
    handle: edge.node.handle,
    title: edge.node.title,
    href: `/shop/${edge.node.handle}`,
  }));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        <aside className="lg:col-span-1">
          <Card className="sticky top-6 gap-0 py-0 overflow-hidden">
            <CardHeader className="py-4 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-body font-semibold">Collections</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CollectionsSideNav items={items} pathSegmentBeforeHandle="shop" />
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3 min-w-0">{children}</div>
      </div>
    </div>
  );
}
