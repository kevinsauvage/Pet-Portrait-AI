const ListingHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    {children}
  </div>
);

export default ListingHeader;
