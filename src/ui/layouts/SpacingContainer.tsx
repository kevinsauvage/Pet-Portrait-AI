import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SpacingContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * Spacing variant for consistent spacing across the app
   * - `section`: Large spacing for page sections (py-8 md:py-12)
   * - `card`: Medium spacing for card content (p-4 md:p-6)
   * - `compact`: Small spacing for tight layouts (p-2 md:p-4)
   */
  variant?: 'section' | 'card' | 'compact';
};

/**
 * Standardized spacing container for consistent layout spacing
 */
const SpacingContainer = ({ children, className, variant = 'section' }: SpacingContainerProps) => {
  const variantClasses = {
    section: 'py-8 md:py-12',
    card: 'p-4 md:p-6',
    compact: 'p-2 md:p-4',
  };

  return <div className={cn(variantClasses[variant], className)}>{children}</div>;
};

export default SpacingContainer;
