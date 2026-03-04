import { cn } from '@/lib/cn';

type LegalContentProps = {
  html: string;
  className?: string;
};

/**
 * LegalContent component renders HTML content from Shopify's policy API.
 *
 * Security note: We use dangerouslySetInnerHTML here because:
 * - Content comes directly from Shopify's Storefront API (trusted source)
 * - Shopify sanitizes policy content on their end
 * - Policies are managed through Shopify admin, not user-generated content
 * - This is the standard approach for Shopify policy pages
 */
const LegalContent = ({ html, className }: LegalContentProps) => (
  <div
    className={cn('legal-content', className)}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export default LegalContent;
