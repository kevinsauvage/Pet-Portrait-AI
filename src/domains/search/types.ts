export type SearchParameters = {
  /** Omitted when `/search` has no `searchQuery` param */
  searchQuery?: string;
  after?: string;
  before?: string;
  sort_key?: string;
  filters?: string;
  reverse?: boolean;
};
