'use client';

import { useSearchParams } from 'next/navigation';

import config from '@/core/config';
import type { AiPortraitCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CollectionsSideNav from '@/ui/components/catalog/CollectionsSideNav';

interface CollectionsNavigationProps {
  collections: AiPortraitCollection[];
}

export default function CollectionsNavigation({ collections }: CollectionsNavigationProps) {
  const searchParams = useSearchParams();

  const artwork = searchParams.get('artwork') || undefined;
  const photo = searchParams.get('photo') || undefined;
  const styleId = searchParams.get('styleId') || undefined;
  const generationId = searchParams.get('generationId') || undefined;
  const urls = searchParams.get('urls') || undefined;

  const qs = buildCreateFlowQueryString({ artwork, photo, styleId, generationId, urls });

  const items = collections.map((collection) => ({
    handle: collection.handle,
    title: collection.title,
    href: `${config.routes.createCollections}/${collection.handle}${qs}`,
  }));

  return (
    <CollectionsSideNav
      items={items}
      pathSegmentBeforeHandle="collections"
    />
  );
}
