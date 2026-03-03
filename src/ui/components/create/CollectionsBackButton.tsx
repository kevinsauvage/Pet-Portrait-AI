import Link from 'next/link';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

interface CollectionsBackButtonProps {
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
}

export default function CollectionsBackButton({
  photo,
  styleId,
  generationId,
  urls,
}: CollectionsBackButtonProps) {
  const backHref = `${config.routes.createGenerating}${buildCreateFlowQueryString({
    photo,
    styleId,
    generationId,
    urls,
  })}`;

  return (
    <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
      <Link href={backHref}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
    </Button>
  );
}
