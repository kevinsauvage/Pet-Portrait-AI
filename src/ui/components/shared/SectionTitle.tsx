import { cn } from '@/lib/cn';

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
};

const SectionTitle = ({ children, className, as = 'h2', id }: SectionTitleProps) => {
  const HeadingTag = as;
  return (
    <HeadingTag id={id} className={cn('text-heading-2 tracking-tight', className)}>
      {children}
    </HeadingTag>
  );
};

export default SectionTitle;
