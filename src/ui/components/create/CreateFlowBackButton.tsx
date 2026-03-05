import Link from 'next/link';

import config from '@/core/config';
import {
  buildCreateFlowQueryString,
  type CreateFlowParams,
} from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

interface CreateFlowBackButtonProps extends CreateFlowParams {
  target: 'create' | 'style' | 'generating' | 'collections';
  label?: string;
}

export default function CreateFlowBackButton({
  target,
  label,
  photo,
  styleId,
  generationId,
  urls,
  artwork,
}: CreateFlowBackButtonProps) {
  let backHref: string;
  let defaultLabel: string;

  switch (target) {
    case 'create':
      backHref = `${config.routes.create}${buildCreateFlowQueryString({ styleId })}`;
      defaultLabel = 'Back';
      break;
    case 'style':
      backHref = `${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`;
      defaultLabel = 'Back';
      break;
    case 'generating':
      backHref = `${config.routes.createGenerating}${buildCreateFlowQueryString({
        photo,
        styleId,
        generationId,
        urls,
      })}`;
      defaultLabel = 'Back';
      break;
    case 'collections':
      backHref = `${config.routes.createCollections}${buildCreateFlowQueryString({
        artwork,
        photo,
        styleId,
        generationId,
        urls,
      })}`;
      defaultLabel = 'Back to Collections';
      break;
    default:
      backHref = config.routes.create;
      defaultLabel = 'Back';
      break;
  }

  return (
    <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
      <Link href={backHref}>
        <ArrowLeft className="h-4 w-4" />
        {label ?? defaultLabel}
      </Link>
    </Button>
  );
}
