'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu';

import { SortDesc } from 'lucide-react';

const Sort = ({
  query,
  sortingOptions,
}: {
  query: {
    sort_key?: string;
  };
  sortingOptions: ReadonlyArray<{ label: string; name: string }>;
}) => {
  const router = useRouter();

  const handleChange = (value: string) => {
    const { pathname } = window.location;
    const searchParameters = new URLSearchParams();
    searchParameters.set('sort_key', value);
    router.push(`${pathname}?${searchParameters.toString()}`);
  };

  const currentLabel =
    sortingOptions.find((item) => item.name.toLowerCase() === query.sort_key?.toLowerCase())
      ?.label || 'Sort by';

  return (
    <div className="flex flex-col items-start gap-2">
      <small className="text-muted-foreground">Sort</small>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="gap-2">
            {currentLabel}
            <SortDesc className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" sideOffset={5} align="start">
          {sortingOptions.map((option) => (
            <DropdownMenuItem key={option.name} onClick={() => handleChange(option.name)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Sort;
