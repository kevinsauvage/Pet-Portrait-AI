'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';

interface AdminNavItem {
  href: string;
  label: string;
  badge?: number;
  badgeVariant?: ComponentProps<typeof Badge>['variant'];
}

interface AdminNavProps {
  items: AdminNavItem[];
}

export default function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Button
            key={item.href}
            asChild
            size="sm"
            variant={isActive ? 'default' : 'outline'}
            className="gap-2"
            aria-current={isActive ? 'page' : undefined}
          >
            <Link href={item.href} className={cn('flex items-center gap-2')}>
              <span>{item.label}</span>
              {typeof item.badge === 'number' && (
                <Badge variant={item.badgeVariant ?? 'secondary'}>{item.badge}</Badge>
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
