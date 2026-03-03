import { cn } from '@/lib/cn';

const MainContent = ({
  children,
  className,
  ...properties
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement> & { [key: string]: unknown }) => {
  return (
    <div
      className={cn(
        'mx-auto mb-12 flex max-w-7xl flex-col space-y-8',
        className,
      )}
      {...properties}
    >
      <div className="container mx-auto">{children}</div>
    </div>
  );
};

export default MainContent;
