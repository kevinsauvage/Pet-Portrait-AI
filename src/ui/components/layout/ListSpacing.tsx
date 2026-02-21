import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type ListSpacingProps = {
  children: ReactNode;
  className?: string;
  /**
   * Standardized spacing scale for lists/grids
   * - Base: gap-4 (16px)
   * - Medium: md:gap-6 (24px)
   * - Large: lg:gap-8 (32px)
   */
};

/**
 * Standardized spacing for lists and grids
 * Ensures consistent spacing across all listing components
 */
const ListSpacing = ({ children, className }: ListSpacingProps) => {
  return <div className={cn('gap-4 md:gap-6 lg:gap-8', className)}>{children}</div>;
};

export default ListSpacing;
