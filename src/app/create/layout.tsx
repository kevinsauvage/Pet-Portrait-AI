import type { ReactNode } from 'react';

import PageBanner from '@/ui/components/shared/PageBanner';

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PageBanner
        title="Create Your Pet Portrait"
        description="Upload a photo, pick a style, and watch AI transform your pet into stunning artwork."
      />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-8">{children}</div>
      </div>
    </div>
  );
}
