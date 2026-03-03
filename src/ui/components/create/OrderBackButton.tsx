import Link from 'next/link';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

interface OrderBackButtonProps {
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  artwork?: string;
}

export default function OrderBackButton({
  photo,
  styleId,
  generationId,
  urls,
  artwork,
}: OrderBackButtonProps) {
  // Default to collections page, or use the first collection if we have artwork context
  const backHref = `${config.routes.createCollections}${buildCreateFlowQueryString({
    artwork,
    photo,
    styleId,
    generationId,
    urls,
  })}`;

  return (
    <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
      <Link href={backHref}>
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Link>
    </Button>
  );
}
