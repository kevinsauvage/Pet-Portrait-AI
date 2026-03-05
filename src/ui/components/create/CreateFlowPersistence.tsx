'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import config from '@/core/config';
import { api } from '@/infra/http/api-client';

/**
 * Saves the current create flow URL to the user's Shopify metafield when they
 * navigate within the create flow (when photo or artwork params are present).
 * Only persists for logged-in users; API returns 401 for guests.
 */
export default function CreateFlowPersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname?.startsWith(config.routes.create)) return;

    const photo = searchParams.get('photo');
    const artwork = searchParams.get('artwork');

    // Only save when we have flow progress (photo or artwork)
    if (!photo && !artwork) return;

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Avoid redundant saves
    if (lastSavedRef.current === url) return;
    lastSavedRef.current = url;

    api
      .post('/api/create-flow', { url })
      .then(() => {
        // Success - metafield updated
      })
      .catch(() => {
        // 401 for guests or other errors - ignore
        lastSavedRef.current = null;
      });
  }, [pathname, searchParams]);

  return null;
}
