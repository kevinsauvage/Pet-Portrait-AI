'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';

import { SortDesc } from 'lucide-react';

const Sort = ({
  query,
  sortingOptions,
}: {
  query: {
    sort_key?: string;
  };
  sortingOptions: { label: string; name: string }[];
}) => {
  const router = useRouter();

  const handleChange = (value: string) => {
    const {pathname} = window.location;
    const searchParameters = new URLSearchParams();
    searchParameters.set('sort_key', value);
    router.push(`${pathname}?${searchParameters.toString()}`);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <small>Sort by </small>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            {sortingOptions.find(
              (item) => item.name.toLowerCase() === query.sort_key?.toLowerCase(),
            )?.label || 'Select an option'}
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
