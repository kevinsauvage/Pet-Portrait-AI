'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/utils';
import FormFieldError from '@/ui/components/shared/FormFieldError';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

import { Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = {
  id?: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string | string[];
};

const PasswordField = ({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  disabled,
  required,
  value,
  onChange,
  className,
  error,
}: PasswordFieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);
  const errorMessage = Array.isArray(error) ? error.at(-1) : error;
  const hasError = !!errorMessage;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className="pr-10"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-secondary hover:text-primary"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <FormFieldError error={error} fieldId={inputId} />
    </div>
  );
};

export default PasswordField;
