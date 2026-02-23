const ListingHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
    {children}
  </div>
);

export default ListingHeader;
