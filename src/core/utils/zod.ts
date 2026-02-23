import type { ZodError } from 'zod';

export function formatZodErrorMessage(error: ZodError): string {
  const { formErrors, fieldErrors } = error.flatten();
  const fieldMessages = Object.values(fieldErrors)
    .flat()
    .filter((item): item is string => typeof item === 'string' && item.length > 0);
  const firstFormError = formErrors.find((item) => typeof item === 'string' && item.length > 0);
  return firstFormError ?? fieldMessages[0] ?? 'Invalid request data';
}
