export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type PaginatedResult<T> = {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount?: number;
};

export type Money = {
  amount: number;
  currencyCode: string;
};
