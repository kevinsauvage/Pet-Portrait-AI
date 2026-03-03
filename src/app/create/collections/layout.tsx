import type { ReactNode } from 'react';

import { getAiPortraitCollections } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import CollectionsNavigation from '@/ui/components/create/CollectionsNavigation';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Card, CardContent, CardHeader } from '@/ui/primitives/card';

import { Package } from 'lucide-react';

interface CollectionsLayoutProps {
  children: ReactNode;
}

export default async function CollectionsLayout({ children }: CollectionsLayoutProps) {
  const collections = await getAiPortraitCollections();

  return (
    <>
      <CreateProgressBar currentStep="collections" />
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Aside Navigation */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <h2 className="text-heading-4 font-semibold">Collections</h2>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CollectionsNavigation collections={collections} />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </>
  );
}
