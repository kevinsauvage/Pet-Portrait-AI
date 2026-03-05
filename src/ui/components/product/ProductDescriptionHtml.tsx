import * as React from 'react';

import { sanitizeHtml } from '@/core/utils/sanitize';
import { cn } from '@/lib/utils';

interface ProductDescriptionHtmlProps extends React.ComponentPropsWithoutRef<'div'> {
  html: string;
}

/**
 * Renders sanitized product description HTML with consistent typography.
 * Supports paragraphs, lists, strong/em, and headings.
 */
const ProductDescriptionHtml = React.forwardRef<HTMLDivElement, ProductDescriptionHtmlProps>(
  ({ html, className, dangerouslySetInnerHTML: _omit, ...props }, ref) => {
    if (!html?.trim()) return null;

    const sanitized = sanitizeHtml(html);

    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          'product-description text-body-sm text-muted-foreground',
          '[&_p]:mt-3 [&_p:first-child]:mt-0',
          '[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5',
          '[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5',
          '[&_li]:leading-relaxed',
          '[&_strong]:font-semibold [&_strong]:text-foreground',
          '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary/80',
          '[&_h1]:text-heading-4 [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-heading-5 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-body [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1.5',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mt-3',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  },
);
ProductDescriptionHtml.displayName = 'ProductDescriptionHtml';

export default ProductDescriptionHtml;
