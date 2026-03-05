import { cn } from '@/lib/utils';

type FormProperties = {
  children: React.ReactNode;
  action: (formData: FormData) => void | Promise<void>;
} & React.HTMLProps<HTMLFormElement>;

const Form = ({ children, action, className, ...rest }: FormProperties) => {
  return (
    <form action={action} className={cn('space-y-6', className)} {...rest}>
      {children}
    </form>
  );
};

export default Form;
