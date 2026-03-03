'use client';

import { useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import GalleryGrid, { type GalleryItem } from '@/ui/components/media/GalleryGrid';
import { Button } from '@/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';

type StyleGalleryProps = {
  items: readonly GalleryItem[];
  ariaLabel?: string;
  className?: string;
};

type FilterGroupProps = {
  label: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
};

const ALL_FILTER = 'all';

const getUniqueOptions = (
  items: readonly GalleryItem[],
  getValue: (item: GalleryItem) => string,
) => {
  const seen = new Set<string>();
  const options: string[] = [];

  items.forEach((item) => {
    const value = getValue(item);
    if (!seen.has(value)) {
      seen.add(value);
      options.push(value);
    }
  });

  return options;
};

const FilterGroup = ({ label, options, value, onValueChange }: FilterGroupProps) => {
  const filters = ['All', ...options];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label font-semibold text-foreground">{label}</p>
      </div>
      <Tabs value={value} onValueChange={onValueChange} className="gap-1">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto w-full justify-start">
          {filters.map((filter) => {
            const filterValue = filter === 'All' ? ALL_FILTER : filter;
            return (
              <TabsTrigger
                key={`${label}-${filterValue}`}
                value={filterValue}
                className={cn(
                  'flex-none h-9 px-4 text-sm font-medium transition-all',
                  'border border-border bg-background hover:bg-accent hover:border-primary/30',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                  'data-[state=active]:border-primary data-[state=active]:shadow-sm',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {filter}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {filters.map((filter) => {
          const filterValue = filter === 'All' ? ALL_FILTER : filter;
          return (
            <TabsContent
              key={`${label}-content-${filterValue}`}
              value={filterValue}
              className="sr-only"
            >
              {label} filter set to {filter}.
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

const StyleGallery = ({ items, ariaLabel = 'Gallery', className }: StyleGalleryProps) => {
  const [activeStyle, setActiveStyle] = useState(ALL_FILTER);
  const [activePetType, setActivePetType] = useState(ALL_FILTER);

  const styles = useMemo(() => getUniqueOptions(items, (item) => item.style), [items]);
  const petTypes = useMemo(() => getUniqueOptions(items, (item) => item.petType), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStyle = activeStyle === ALL_FILTER || item.style === activeStyle;
      const matchesPetType = activePetType === ALL_FILTER || item.petType === activePetType;

      return matchesStyle && matchesPetType;
    });
  }, [items, activeStyle, activePetType]);

  const hasActiveFilters = activeStyle !== ALL_FILTER || activePetType !== ALL_FILTER;

  const handleClearFilters = () => {
    setActiveStyle(ALL_FILTER);
    setActivePetType(ALL_FILTER);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <FilterGroup
            label="Style"
            options={styles}
            value={activeStyle}
            onValueChange={setActiveStyle}
          />
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <FilterGroup
            label="Pet Type"
            options={petTypes}
            value={activePetType}
            onValueChange={setActivePetType}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-muted/30 px-4 py-3">
        <p className="text-body-sm font-medium text-foreground">
          Showing <span className="text-primary">{filteredItems.length}</span> of{' '}
          <span className="text-muted-foreground">{items.length}</span> portraits
        </p>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2">
            <span>Clear filters</span>
          </Button>
        )}
      </div>

      {filteredItems.length > 0 ? (
        <GalleryGrid items={filteredItems} ariaLabel={ariaLabel} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center">
          <p className="text-body font-medium text-foreground">No portraits match your filters.</p>
          <p className="text-body-sm text-muted-foreground mt-2">
            Try adjusting your style or pet type to see more options.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleGallery;
