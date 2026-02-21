const ListingHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <div className="flex justify-between gap-2 items-end mb-6">{children}</div>;

export default ListingHeader;
