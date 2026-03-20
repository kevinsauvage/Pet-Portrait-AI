'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { logger } from '@/core/utils/logger';
import type { PredictiveSearchQuery } from '@/infra/shopify/generated/storefront/index';
import SearchForm from '@/ui/components/search/SearchForm';

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { useOnClickOutside } from 'usehooks-ts';

const SearchResults = dynamic(() => import('@/ui/components/search/SearchResults'));

async function fetchPredictiveSearch(
  q: string,
  signal: AbortSignal | undefined,
): Promise<PredictiveSearchQuery['predictiveSearch'] | null> {
  const response = await fetch(`/api/search/predictive?q=${encodeURIComponent(q)}`, { signal });

  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }

  const data = (await response.json()) as {
    predictiveSearch?: PredictiveSearchQuery['predictiveSearch'];
  };
  return data?.predictiveSearch ?? null;
}

const Search = ({ searchQuery }: { searchQuery: string }) => {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [debouncedSearch] = useDebounce(searchValue, 500);
  const [hidePanel, setHidePanel] = useState(false);
  const reference = useRef<HTMLDivElement>(null);
  const hidePanelOnOutside = useCallback(() => setHidePanel(true), []);
  useOnClickOutside(reference as RefObject<HTMLElement>, hidePanelOnOutside, 'mousedown');
  useOnClickOutside(reference as RefObject<HTMLElement>, hidePanelOnOutside, 'touchstart');
  const resultsId = 'predictive-search-results';

  const trimmed = debouncedSearch.trim();
  const enabled = trimmed.length >= 2;

  const {
    data: queryResults,
    isError,
    error,
  } = useQuery({
    queryKey: ['predictive-search', trimmed],
    queryFn: ({ signal }) => fetchPredictiveSearch(trimmed, signal),
    enabled,
  });

  useEffect(() => {
    if (isError && error) {
      logger.error('Search failed', { context: 'search', error });
    }
  }, [isError, error]);

  const results = hidePanel || !enabled ? null : (queryResults ?? null);

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={reference}>
      <SearchForm
        searchQuery={searchValue}
        resultsId={resultsId}
        resultsOpen={Boolean(results)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(event.target.value);
          setHidePanel(false);
        }}
      />

      {results && <SearchResults id={resultsId} results={results} />}
    </div>
  );
};

export default Search;
