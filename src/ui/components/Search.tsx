'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import useOnClickOutside from '@/hooks/useClickOutside';
import type { PredictiveSearchQuery } from '@/infra/shopify/storefront';
import debounce from '@/lib/debounce';
import SearchForm from '@/ui/components/SearchForm';

const SearchResults = dynamic(() => import('@/ui/components/SearchResults'));

const Search = ({ searchQuery }: { searchQuery: string }) => {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [results, setResults] = useState<PredictiveSearchQuery['predictiveSearch'] | null>(null);
  const reference = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(reference as RefObject<HTMLElement>, () => setResults(null));
  const resultsId = 'predictive-search-results';

  const handleChange = useCallback(async (value: string) => {
    if (value?.trim().length < 2) {
      setResults(null);
      return;
    }

    try {
      const response = await fetch(`/api/search/predictive?q=${encodeURIComponent(value.trim())}`);

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setResults(data?.predictiveSearch || null);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    }
  }, []);

  const debouncedHandleChange = useMemo(
    () =>
      debounce((value: unknown) => {
        if (typeof value !== 'string') return;
        handleChange(value);
      }, 500),
    [handleChange],
  );

  useEffect(() => {
    return () => debouncedHandleChange.cancel();
  }, [debouncedHandleChange]);

  useEffect(() => {
    setResults(null);
    setSearchValue(searchQuery);
  }, [searchQuery]);

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={reference}>
      <SearchForm
        searchQuery={searchValue}
        resultsId={resultsId}
        resultsOpen={Boolean(results)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(event.target.value);
          debouncedHandleChange(event.target.value);
        }}
      />

      {results && <SearchResults id={resultsId} results={results} />}
    </div>
  );
};

export default Search;
