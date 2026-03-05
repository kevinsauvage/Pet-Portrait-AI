import { sanitizeHtml } from '@/core/utils/sanitize';
import { cn } from '@/lib/utils';

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
 *
 * Defense in depth: We sanitize the HTML before rendering to prevent XSS
 * if Shopify data is ever compromised or misconfigured.
 */
const LegalContent = ({ html, className }: LegalContentProps) => (
  <div
    className={cn('legal-content', className)}
    dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
  />
);

export default LegalContent;
