const Title = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <h2 className={`text-heading-2 ${className || ''}`}>{children}</h2>;
};

export default Title;
