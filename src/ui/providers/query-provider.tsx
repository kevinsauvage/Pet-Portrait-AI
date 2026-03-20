'use client';

import { useState } from 'react';

import { createBrowserQueryClient } from '@/lib/query-client';

import { QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createBrowserQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
