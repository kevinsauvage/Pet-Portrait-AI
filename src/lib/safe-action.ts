import { createSafeActionClient } from 'next-safe-action';

/**
 * Base client for validated server actions (`next-safe-action`).
 * Use `.inputSchema(zodSchema).stateAction(...)` with React `useActionState`, or `.action(...)` for one-shot calls.
 */
export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
});
