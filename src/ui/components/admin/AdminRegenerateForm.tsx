'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { regeneratePortraitAction } from '@/domains/ai/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import { Button } from '@/ui/primitives/button';

import { RotateCcw } from 'lucide-react';

interface AdminRegenerateFormProps {
  styleId: string;
  originalPhotoUrl: string;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="outline"
      size="sm"
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      <RotateCcw className={`mr-1 h-3 w-3 ${pending ? 'animate-spin' : ''}`} />
      Retry
    </Button>
  );
};

export default function AdminRegenerateForm({
  styleId,
  originalPhotoUrl,
}: AdminRegenerateFormProps) {
  const [state, action] = useActionState(regeneratePortraitAction, {});

  useFormStatesEffect({
    states: state,
    userFeedback: {
      success: 'Regeneration started',
      error: 'Regeneration failed',
    },
  });

  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="styleId" value={styleId} />
      <input type="hidden" name="originalPhotoUrl" value={originalPhotoUrl} />
      <SubmitButton />
    </form>
  );
}
