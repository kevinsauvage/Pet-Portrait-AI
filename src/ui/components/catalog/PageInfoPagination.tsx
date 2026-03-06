import { headers } from 'next/headers';
import Link from 'next/link';

import { getNextPath, getPreviousPath } from '@/infra/shopify/helpers';
import type { PageInfo } from '@/infra/shopify/storefront';
import { Button } from '@/ui/primitives/button';

const PageInfoPagination = async ({
  pageInfo,
  searchParameters,
  pathname,
}: {
  pageInfo: PageInfo;
  searchParameters: {
    after?: string;
    before?: string;
    sort_key?: string;
  };
  pathname?: string;
}) => {
  const currentPathname =
    pathname ||
    (await headers()).get('x-pathname') ||
    (await headers()).get('x-invoke-path') ||
    '/';

  const previousPath = getPreviousPath(currentPathname, pageInfo, searchParameters);
  const nextPath = getNextPath(currentPathname, pageInfo, searchParameters);

  return (
    <div className="flex items-center justify-between gap-2">
      {pageInfo.hasPreviousPage ? (
        <Button variant="secondary" asChild>
          <Link href={previousPath} aria-label="Previous Page">
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="secondary" disabled aria-disabled>
          Previous
        </Button>
      )}

      {pageInfo.hasNextPage ? (
        <Button variant="secondary" asChild>
          <Link href={nextPath} aria-label="Next Page">
            Next
          </Link>
        </Button>
      ) : (
        <Button variant="secondary" disabled aria-disabled>
          Next
        </Button>
      )}
    </div>
  );
};

export default PageInfoPagination;
