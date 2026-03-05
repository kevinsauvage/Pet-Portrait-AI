import { cn } from '@/lib/utils';

type FormFieldErrorProps = {
  error?: string | string[];
  fieldId: string;
  className?: string;
};

/**
 * Accessible form field error component that:
 * - Links to input via aria-describedby using the fieldId
 * - Announces errors to screen readers via aria-live
 * - Provides consistent error styling
 */
const FormFieldError = ({ error, fieldId, className }: FormFieldErrorProps) => {
  const errorId = `${fieldId}-error`;
  const errorMessage = Array.isArray(error) ? error.at(-1) : error;

  if (!errorMessage) {
    return null;
  }

  return (
    <p
      id={errorId}
      role="alert"
      aria-live="polite"
      className={cn('text-destructive text-body-sm mt-1', className)}
    >
      {errorMessage}
    </p>
  );
};

export default FormFieldError;
