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
      className={`${className} flex flex-col space-y-12 max-w-6xl mx-auto mb-12`}
      {...properties}
    >
      <div className="container mx-auto">{children}</div>
    </div>
  );
};

export default MainContent;
