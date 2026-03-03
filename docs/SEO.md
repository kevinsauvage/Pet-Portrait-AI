# SEO Implementation Guide

This document describes the SEO implementation and best practices for PetPortrait AI.

## Overview

The site implements comprehensive SEO features including:

- Structured data (JSON-LD) for products, organization, and breadcrumbs
- Optimized meta descriptions and titles
- Open Graph and Twitter Card metadata
- Canonical URLs
- Sitemap generation
- Robots.txt configuration

## Structured Data (JSON-LD)

### Organization Schema

Added to root layout (`src/app/layout.tsx`):

- Company name, logo, contact information
- Social media profiles (Facebook, Twitter, Instagram, LinkedIn)
- Contact point information

### Product Schema

Added to product pages (`src/app/shop/[collectionSlug]/[productSlug]/page.tsx`):

- Product name, description, images
- Pricing and availability
- SKU and product ID
- Brand information
- Offer details with currency and validity

### Breadcrumb Schema

Added to product pages:

- Hierarchical navigation structure
- Helps search engines understand site structure

### Website Schema

Added to root layout:

- Site name and URL
- Search action for site search functionality

## Meta Tags & Open Graph

### Implementation

All pages use `generateMetadata()` utility (`src/core/utils/metadata.ts`):

- **Title**: Uses Next.js template format (`%s | PetPortrait AI`)
- **Description**: Optimized to 150-160 characters
- **Canonical URLs**: Automatically generated for all pages
- **Open Graph**: Full OG tags with images, titles, descriptions
- **Twitter Cards**: Large image cards with optimized content

### Product Pages

- Uses product-specific images for Open Graph
- Product title and description from Shopify SEO fields
- Falls back to product title/description if SEO fields not set

### Collection Pages

- Uses collection images for Open Graph
- Collection-specific titles and descriptions

## Meta Descriptions

All meta descriptions are optimized:

- **Length**: 150-160 characters (optimal for search results)
- **Keywords**: Include relevant terms (pet portrait, AI, custom artwork)
- **Call-to-action**: Include action words when appropriate
- **Uniqueness**: Each page has unique, descriptive content

### Key Pages

- **Home**: Emphasizes transformation, product options, free shipping
- **Create**: Highlights AI process, style options, speed
- **Shop**: Focuses on product types and formats
- **Styles**: Lists specific style options
- **Gallery**: Emphasizes inspiration and examples

## Sitemap

### Static Pages

Includes all important pages:

- Home (priority: 1.0)
- Create (priority: 0.95)
- Styles, Gallery (priority: 0.9, 0.85)
- Shop, Collections
- Legal pages (Privacy, Terms, Shipping, Refund)
- Account pages

### Dynamic Content

- **Products**: Automatically added from Shopify (priority: 0.7)
- **Collections**: Automatically added from Shopify (priority: 0.8)
- **Change Frequency**: Daily for collections, weekly for products
- **Last Modified**: Uses Shopify `updatedAt` timestamps

### Configuration

- Revalidates every hour (3600 seconds)
- Handles Shopify API failures gracefully
- Base URL from environment variable

## Robots.txt

### Configuration

Located at `src/app/robots.ts`:

- Allows all crawlers (`userAgent: '*'`)
- Disallows:
  - `/account/` - Private user pages
  - `/api/` - API routes
  - `/search` - Dynamic search pages
  - `/cart` - User-specific cart pages
- References sitemap location

### Best Practices

- Public pages are crawlable
- Private/user-specific pages are blocked
- Sitemap is properly referenced

## Page Titles

### Template Format

All pages use Next.js title template:

```
%s | PetPortrait AI
```

### Examples

- Home: `PetPortrait AI — Custom AI Pet Portraits | PetPortrait AI`
- Product: `[Product Name] | PetPortrait AI`
- Collection: `[Collection Name] | PetPortrait AI`

## Canonical URLs

All pages include canonical URLs:

- Prevents duplicate content issues
- Points to the correct URL version
- Uses `metadataBase` for consistent base URL

## Open Graph Images

### Default Image

- Uses site logo as fallback
- Configured in `siteMetadata.siteLogo`

### Page-Specific Images

- **Products**: First product image
- **Collections**: Collection image
- **Other pages**: Site logo

### Image Specifications

- **Size**: 1200x630px (recommended OG size)
- **Format**: Supports all image formats
- **Alt text**: Uses page title

## Internal Linking

### Breadcrumbs

- Implemented on product pages
- Provides hierarchical navigation
- Includes structured data

### Related Products

- Product recommendations on product pages
- Helps with internal linking structure
- Improves user engagement

## Best Practices

### Do's

✅ Use descriptive, unique titles for each page
✅ Keep meta descriptions between 150-160 characters
✅ Include relevant keywords naturally
✅ Use product/collection images for Open Graph
✅ Ensure all pages have canonical URLs
✅ Keep structured data up to date
✅ Test with Google Rich Results Test

### Don'ts

❌ Don't use duplicate meta descriptions
❌ Don't exceed 160 characters in descriptions
❌ Don't keyword stuff
❌ Don't forget to update structured data when schema changes
❌ Don't block important pages in robots.txt

## Testing & Validation

### Tools

- **Google Rich Results Test**: Validate structured data
- **Google Search Console**: Monitor indexing and performance
- **Lighthouse**: Check SEO score
- **Open Graph Debugger**: Test OG tags
- **Schema.org Validator**: Validate JSON-LD

### Checklist

- [ ] All pages have unique titles
- [ ] All pages have meta descriptions (150-160 chars)
- [ ] Product pages have structured data
- [ ] Organization schema is present
- [ ] Sitemap includes all important pages
- [ ] Robots.txt is properly configured
- [ ] Canonical URLs are set
- [ ] Open Graph images are optimized
- [ ] Internal linking structure is good

## Future Improvements

- [ ] Add review/rating structured data when reviews are implemented
- [ ] Add FAQ structured data for common questions
- [ ] Add video structured data for product videos
- [ ] Implement hreflang tags for internationalization
- [ ] Add article structured data for blog posts
- [ ] Optimize images further (WebP, lazy loading)
- [ ] Add more internal linking opportunities

## Files Reference

- **Structured Data**: `src/core/utils/structured-data.ts`
- **Metadata Utility**: `src/core/utils/metadata.ts`
- **SEO Config**: `src/core/config/seo.ts`
- **Sitemap**: `src/app/sitemap.tsx`
- **Robots**: `src/app/robots.ts`
- **Product SEO**: `src/domains/products/services/product-details.service.ts`
