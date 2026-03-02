import type { ReactNode } from 'react';

import PageBanner from '@/ui/components/shared/PageBanner';

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PageBanner
        title="Create Your Pet Portrait"
        description="Upload a photo, pick a style, and watch AI transform your pet into stunning artwork."
      />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-10">{children}</div>
      </div>
    </div>
  );
}
