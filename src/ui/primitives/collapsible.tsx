'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = ({ ...properties }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) => {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...properties} />;
};

const CollapsibleTrigger = ({
  ...properties
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...properties} />
  );
};

const CollapsibleContent = ({
  ...properties
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...properties} />
  );
};

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
