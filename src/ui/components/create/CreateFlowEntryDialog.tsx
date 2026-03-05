'use client';

import { useRouter } from 'next/navigation';

import { api } from '@/infra/http/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/primitives/alert-dialog';
import { Button } from '@/ui/primitives/button';

interface CreateFlowEntryDialogProps {
  /** Saved create flow URL to continue (e.g. /create/style?photo=...) */
  createFlowUrl: string;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when user dismisses (start over or continue) */
  onDismiss: () => void;
}

/**
 * Shown when user lands on /create and has a saved create flow URL.
 * Asks whether to continue where they left off or start over.
 */
export default function CreateFlowEntryDialog({
  createFlowUrl,
  open,
  onDismiss,
}: CreateFlowEntryDialogProps) {
  const router = useRouter();

  const handleContinue = () => {
    onDismiss();
    router.push(createFlowUrl);
  };

  const handleStartOver = async () => {
    try {
      await api.delete('/api/create-flow');
    } catch {
      // Ignore - we'll still dismiss and show upload
    }
    onDismiss();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Continue where you left off?</AlertDialogTitle>
          <AlertDialogDescription>
            You have an unfinished portrait in progress. Would you like to continue or start a new
            one?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleStartOver}>
              Start over
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleContinue}>Continue</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
