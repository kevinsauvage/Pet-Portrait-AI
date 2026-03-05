'use client';

import { useState } from 'react';

import CreateFlowEntryDialog from '@/ui/components/create/CreateFlowEntryDialog';
import UploadIsland from '@/ui/components/create/islands/UploadIsland';

interface CreatePageWithEntryDialogProps {
  /** Saved create flow URL from metafield, or null */
  createFlowUrl: string | null;
  initialStyleId?: string;
}

/**
 * Create page content with optional "continue or start over" dialog
 * when user has a saved create flow.
 */
export default function CreatePageWithEntryDialog({
  createFlowUrl,
  initialStyleId,
}: CreatePageWithEntryDialogProps) {
  const [showEntryDialog, setShowEntryDialog] = useState(
    () =>
      !!createFlowUrl &&
      createFlowUrl !== '/create' &&
      (createFlowUrl.includes('photo=') || createFlowUrl.includes('artwork=')),
  );

  return (
    <>
      {createFlowUrl && (
        <CreateFlowEntryDialog
          createFlowUrl={createFlowUrl}
          open={showEntryDialog}
          onDismiss={() => setShowEntryDialog(false)}
        />
      )}
      <UploadIsland initialStyleId={initialStyleId} />
    </>
  );
}
