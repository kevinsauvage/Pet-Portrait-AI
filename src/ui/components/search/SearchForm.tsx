'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { searchAction } from '@/domains/search/actions';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

import { Search } from 'lucide-react';

const SubmitButton = ({ ...properties }: React.ComponentProps<'button'>) => {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="group absolute right-3 top-1/2 -translate-y-1/2"
      aria-label="Search"
      {...properties}
    >
      <Search className="text-secondary group-hover:text-primary transition-colors" />
    </button>
  );
};

const SearchForm = ({
  searchQuery,
  onChange,
  resultsId,
  resultsOpen = false,
}: {
  searchQuery: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  resultsId?: string;
  resultsOpen?: boolean;
}) => {
  const [value, setValue] = useState(searchQuery || '');
  const [, action] = useActionState(() => searchAction(value), undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange(event);
  };

  useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

  return (
    <form action={action} className="relative w-full max-w-2xl mx-auto">
      <Label htmlFor="search-input" className="sr-only">
        Search products
      </Label>
      <div className="relative">
        <Input
          id="search-input"
          className="py-7 pl-10 pr-11"
          type="search"
          name="searchQuery"
          placeholder="Search products, styles, or collections"
          aria-label="Search products"
          aria-controls={resultsId}
          aria-expanded={resultsOpen}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint="search"
          onChange={handleChange}
          value={value}
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <SubmitButton />
    </form>
  );
};

export default SearchForm;
