'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import type { Filter } from '@/infra/shopify/storefront';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/ui/accordion';
import { Button } from '@/ui/components/ui/button';
import { Checkbox } from '@/ui/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet';
import { Slider } from '@/ui/components/ui/slider';

import { FilterIcon } from 'lucide-react';

// IMPORTANT: do not import runtime enums from `@/infra/shopify/storefront` in client components.
// The generated Storefront SDK pulls in `graphql-request`/`graphql-tag` and will bloat the client bundle.
const FILTER_TYPE = {
  boolean: 'BOOLEAN',
  list: 'LIST',
  priceRange: 'PRICE_RANGE',
} as const;

const Filters = ({
  filters,
  query,
}: {
  filters: Filter[];
  query: {
    after?: string;
    before?: string;
    filters?: string;
    sort_key?: string;
  };
}) => {
  const [selectedFilters, setSelectedFilters] = useState<{ filterId: string; input: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  const pathname = usePathname();
  const router = useRouter();

  const getMinMaxPrice = useCallback((): [number, number] | undefined => {
    const priceRangeFilter = filters?.find((filter) => filter.type === FILTER_TYPE.priceRange);
    if (!priceRangeFilter || !priceRangeFilter.values?.[0]) {
      return undefined;
    }
    const input = priceRangeFilter.values[0].input as string;
    if (!input) return undefined;

    try {
      const parsedInput = JSON.parse(input) as { price?: { min?: number; max?: number } };
      const min = parsedInput?.price?.min ?? 0;
      const max = parsedInput?.price?.max ?? 200;
      return [min, max];
    } catch {
      return undefined;
    }
  }, [filters]);

  const defaultPriceRange = useMemo<[number, number]>(
    () => getMinMaxPrice() ?? [0, 200],
    [getMinMaxPrice],
  );

  const isSelected = useCallback(
    (filterId: string, input: string) =>
      selectedFilters?.some((filter) => filter.input === input && filter.filterId === filterId),
    [selectedFilters],
  );

  const handleSetFilters = useCallback(
    (filterId: string, input: string) => {
      if (isSelected(filterId, input)) {
        const newFilters = selectedFilters.filter((filter) => {
          if (filter.filterId !== filterId) return true;
          return filter.input !== input;
        });

        setSelectedFilters(newFilters);
      } else {
        setSelectedFilters([...selectedFilters, { filterId, input }]);
      }
    },
    [isSelected, selectedFilters],
  );

  const handlePriceChange = (value: number[]) => {
    const [min = 0, max = 0] = value;
    setPriceRange([min, max]);
  };

  const resetFilters = () => {
    const newSearchParameters = new URLSearchParams(query);
    newSearchParameters.delete('filters');
    setSelectedFilters([]);
    setPriceRange(defaultPriceRange);
    router.push(`${pathname}?${newSearchParameters.toString()}`);
  };

  const applyFilters = () => {
    const newSearchParameters = new URLSearchParams(query);
    newSearchParameters.delete('filters');

    selectedFilters.forEach((filter) => {
      newSearchParameters.append('filters', `${filter.filterId}:${filter.input}`);
    });

    if (priceRange) {
      newSearchParameters.append(
        'filters',
        `price:${JSON.stringify({ price: { max: priceRange[1], min: priceRange[0] } })}`,
      );
    }

    router.push(`${pathname}?${newSearchParameters.toString()}`);
    setOpen(false);
  };

  useEffect(() => {
    const currentFilters_ = typeof query.filters === 'string' ? [query.filters] : query.filters;

    const f = currentFilters_
      ?.map((filter) => {
        const [filterId, input] = filter.split(/:(.+)/);
        return { filterId: filterId || '', input: input || '' };
      })
      .filter(
        (item): item is { filterId: string; input: string } =>
          item.filterId !== undefined && item.input !== undefined,
      );

    setSelectedFilters(f || []);
  }, [query.filters]);

  useEffect(() => {
    setPriceRange(defaultPriceRange);
  }, [defaultPriceRange]);

  const activeCount = selectedFilters.length + (priceRange ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <span className="hidden md:inline">Filters</span>
          <FilterIcon className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
          <span className="sr-only">Open filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Select filters to narrow down your search results.</SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="-mt-1">
              Reset
            </Button>
          </div>
        </SheetHeader>
        <div className="px-4">
          <Accordion
            type="multiple"
            defaultValue={filters.map((filter) => filter.id)}
            className="w-full"
          >
            {filters.map((filter) => (
              <AccordionItem key={filter.id} value={filter.id}>
                <AccordionTrigger className="text-body-sm font-medium">
                  {filter.label}
                </AccordionTrigger>
                <AccordionContent>
                  {filter.type === FILTER_TYPE.priceRange && (
                    <div className="space-y-4 py-2">
                      <Slider
                        defaultValue={[defaultPriceRange[0], defaultPriceRange[1]]}
                        max={defaultPriceRange[1]}
                        min={defaultPriceRange[0]}
                        step={0.1}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-body-sm">${(priceRange?.[0] ?? 0).toFixed(2)}</span>
                        <span className="text-body-sm">${(priceRange?.[1] ?? 200).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {filter.type === FILTER_TYPE.list && (
                    <div className="space-y-2">
                      {filter.values.map((value, index) => (
                        <div
                          key={`${value.id}-${index + 1}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={value.id}
                            checked={isSelected(value.id, value.input as string)}
                            onCheckedChange={() => {
                              if (typeof value.input === 'string') {
                                handleSetFilters(value.id, value.input);
                              }
                            }}
                          />
                          <label
                            htmlFor={value.id}
                            className="text-body-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {value.label} ({value.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <SheetFooter>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              Reset
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Filters;
