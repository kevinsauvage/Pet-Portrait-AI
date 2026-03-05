import type { ReactNode } from 'react';

import CreateFlowPersistence from '@/ui/components/create/CreateFlowPersistence';

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <CreateFlowPersistence />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-8">{children}</div>
      </div>
    </div>
  );
}
