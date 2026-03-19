# Gelato Portrait Preview Implementation Plan

## Executive Summary

This document outlines the analysis and implementation plan for adding **real portrait previews** in the create flow for Gelato products. Users will see how their AI-generated portrait will look on the actual physical product (canvas, poster, etc.) before adding to cart.

### Key Requirements (Updated)

- ✅ **Preview generation ONLY on `/create/order` page** - Not on collections page
- ✅ **Preview URL stored in URL params** - Persists through navigation
- ✅ **Preview URL in cart line item attributes** - Available in cart/checkout
- ✅ **Preview updates when variant changes** - Regenerate for new variant

---

## Current State Analysis

### 1. Current Create Flow

**Flow Steps:**
1. `/create` - Upload photo (`UploadIsland.tsx`)
2. `/create/style` - Select AI art style (`StylePage.tsx`)
3. `/create/generating` - Generate portrait artwork
4. `/create/collections/[collection]` - Select product (`CollectionPage.tsx`)
5. `/create/order` - Select variant and add to cart (`CreateOrderPage.tsx`)

**Current Preview State:**
- ✅ Small artwork preview shown in collections/order pages (`CreateFlowArtworkPreview` - 16x16 or 24x24)
- ✅ Original photo preview in style selection (256px-288px)
- ❌ **NO product mockup preview** - Users don't see how portrait looks on actual product
- ❌ Products show generic product images from Shopify, not personalized with user's portrait

### 2. Current Gelato Integration

**Architecture:**
- Uses **Gelato Shopify App** (not direct API calls)
- Products synced from Gelato → Shopify with `gelato.productUid` metafield
- Cart includes `gelato_print_url` attribute
- Gelato app handles fulfillment automatically

**Limitations:**
- No preview generation capability
- No way to show personalized product mockups
- Products display generic Shopify images

### 3. Product Display Locations

**Where products are shown:**
1. **Collections Page** (`/create/collections/[collection]`)
   - `CreateProductRow` component
   - Shows product image from Shopify (generic)
   - No portrait preview

2. **Order Page** (`/create/order`)
   - `AddToCartIsland` component
   - Small artwork preview (`CreateFlowArtworkPreview`)
   - Product details but no mockup

3. **Product Select Sheet** (`ProductSelectSheet.tsx`)
   - Modal/sheet for variant selection
   - No preview integration

---

## Requirements Definition

### What "Real Portrait Preview" Means

1. **Product Mockup Preview**
   - Show user's AI-generated portrait artwork on the actual product
   - Display realistic mockup (e.g., canvas on wall, poster framed, etc.)
   - Preview should match the selected product variant (size, format)

2. **Where to Show Preview**
   - **ONLY on `/create/order` page**: Generate preview when page loads
   - **Large preview**: Show portrait on selected product variant
   - **Preview updates**: When variant changes, regenerate preview for new variant

3. **Preview Persistence**
   - **URL Parameters**: Store preview URL in URL search params (`previewUrl`)
   - **Cart Line Item**: Include preview URL in cart attributes (`gelato_preview_url`)
   - **Navigation**: Preview URL persists when navigating back/forward

4. **User Experience Goals**
   - Users see exactly how their portrait will look on the product
   - Increase confidence before purchase
   - Reduce returns/refunds
   - Improve conversion rates

---

## Gelato API Analysis

### Can We Call Gelato for All Products at Once?

**Short Answer: No, but we can batch individual calls efficiently.**

**Gelato API Capabilities:**

1. **Product Creation API** (`POST /products`)
   - Creates a product from a template with image placeholders
   - Returns `previewUrl`, `externalPreviewUrl`, `externalThumbnailUrl`
   - Each product/template requires a separate API call
   - Mockups are generated asynchronously in the background

2. **Template API** (`GET /templates/{templateId}`)
   - Returns template details including image placeholder dimensions
   - Needed to understand how to position images

3. **Limitations:**
   - ❌ No batch API for multiple products
   - ❌ Each product variant needs its own call
   - ⚠️ Mockup generation is async (may take seconds)
   - ⚠️ Requires Gelato API credentials (separate from Shopify app)

### API Integration Approach

**Option 1: Direct Gelato API Integration (Recommended)**
- Use Gelato API **only for preview generation**
- Keep Shopify app for fulfillment (no changes)
- Generate previews on-demand when user selects product
- Cache preview URLs to avoid repeated API calls

**Option 2: Pre-generate Previews**
- Generate previews when artwork is created
- Store preview URLs in database/cache
- Faster UX but requires storage and upfront generation

**Option 3: Client-Side Mockup Generation**
- Use CSS/Canvas to overlay portrait on product images
- No API calls needed
- Less realistic but faster and simpler

---

## Recommended Implementation Plan

### Phase 1: Gelato API Setup

**1.1 Add Gelato API Client**
- Create `src/infra/gelato/gelato-api-client.ts`
- Configure API credentials (environment variables)
- Implement product preview generation endpoint

**Environment Variables Needed:**
```env
GELATO_API_KEY=your_api_key
GELATO_API_URL=https://api.gelato.com/v5
GELATO_STORE_ID=your_store_id
```

**1.2 Create Preview Service**
- `src/domains/gelato/services/preview.service.ts`
- Function: `generateProductPreview(productUid, artworkUrl, variantSku)`
- Returns: `{ previewUrl, externalPreviewUrl, thumbnailUrl }`

**API Flow:**
```typescript
// 1. Get template details
const template = await gelatoApi.getTemplate(productUid);

// 2. Create product with artwork
const product = await gelatoApi.createProduct({
  templateId: productUid,
  storeId: GELATO_STORE_ID,
  imageLayers: [
    {
      name: template.imagePlaceholders[0].name,
      url: artworkUrl, // User's portrait
    },
  ],
  variants: [{ sku: variantSku }],
});

// 3. Wait for mockup generation (poll or webhook)
const previewUrl = await waitForPreview(product.id);

// 4. Return preview URLs
return {
  previewUrl: product.previewUrl,
  externalPreviewUrl: product.externalPreviewUrl,
  thumbnailUrl: product.externalThumbnailUrl,
};
```

### Phase 2: API Route for Preview Generation

**2.1 Create API Endpoint**
- `src/app/api/gelato/preview/route.ts`
- Accepts: `{ productUid, artworkUrl, variantSku }`
- Returns: Preview URLs
- Handles caching to avoid duplicate API calls

**2.2 Caching Strategy**
- Cache preview URLs by `productUid + artworkUrl + variantSku`
- Use Redis or in-memory cache
- TTL: 24 hours (previews don't change)
- Key format: `gelato:preview:{hash}`

### Phase 3: Update Create Flow Params

**3.1 Add Preview URL to CreateFlowParams**
- Update `CreateFlowParams` interface to include `previewUrl?: string`
- Update `buildCreateFlowParams` to handle preview URL
- Preview URL will be passed through URL params

**File:** `src/domains/ai/ai-portrait/utils/create-flow-params.ts`

**Changes:**
```typescript
export interface CreateFlowParams {
  artwork?: string;
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  productHandle?: string;
  previewUrl?: string; // NEW: Gelato preview URL
}
```

### Phase 4: UI Components

**4.1 Product Preview Component**
- `src/ui/components/create/ProductPortraitPreview.tsx`
- Shows portrait artwork on product mockup
- Loading states while generating preview
- Fallback to generic product image if preview fails

**Props:**
```typescript
interface ProductPortraitPreviewProps {
  previewUrl: string | null;
  product: AiPortraitProduct;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

**4.2 Update Order Page**
- `src/app/create/order/page.tsx`
- Read `previewUrl` from search params
- Pass to preview component
- If no preview URL, trigger generation

**4.3 Update AddToCartIsland Component**
- `src/ui/components/create/islands/AddToCartIsland.tsx`
- Generate preview when component mounts (if not in URL)
- Update preview when variant changes
- Add preview URL to cart attributes
- Update URL params with preview URL

### Phase 5: Cart Integration

**5.1 Add Preview URL to Cart Attributes**
- Update `buildAttributes` in `AddToCartIsland.tsx`
- Add `gelato_preview_url` attribute when preview exists
- Include preview URL in cart line item

**Cart Attribute:**
```typescript
if (previewUrl) {
  attributes.push({ 
    key: 'gelato_preview_url', 
    value: previewUrl 
  });
}
```

**5.2 Update Cart Display**
- `src/ui/components/cart/LineItem.tsx`
- Display preview URL if available in cart attributes
- Show preview in cart for better UX

### Phase 6: Performance Optimization

**6.1 Error Handling**
- Graceful fallback to generic product image
- Retry logic for failed API calls
- User-friendly error messages
- Don't block cart addition if preview fails

**6.2 Rate Limiting**
- Respect Gelato API rate limits
- Queue preview requests if needed
- Implement exponential backoff
- Cache preview URLs to avoid duplicate calls

---

## Technical Implementation Details

### File Structure

```
src/
├── infra/
│   └── gelato/
│       ├── gelato-api-client.ts          # Gelato API client
│       └── types.ts                       # Gelato API types
├── domains/
│   ├── ai/
│   │   └── ai-portrait/
│   │       └── utils/
│   │           └── create-flow-params.ts  # Updated: Add previewUrl param
│   └── gelato/
│       ├── services/
│       │   └── preview.service.ts        # Preview generation service
│       └── types.ts                      # Domain types
├── app/
│   ├── api/
│   │   └── gelato/
│   │       └── preview/
│   │           └── route.ts              # Preview API endpoint
│   └── create/
│       └── order/
│           └── page.tsx                  # Updated: Show preview
└── ui/
    └── components/
        └── create/
            ├── islands/
            │   └── AddToCartIsland.tsx    # Updated: Generate & persist preview
            └── ProductPortraitPreview.tsx # Preview component
```

### API Endpoint Example

```typescript
// src/app/api/gelato/preview/route.ts
export async function POST(request: Request) {
  const { productUid, artworkUrl, variantSku } = await request.json();
  
  // Check cache first
  const cacheKey = `gelato:preview:${hash(productUid + artworkUrl + variantSku)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(JSON.parse(cached));
  
  // Generate preview
  const preview = await GelatoPreviewService.generate({
    productUid,
    artworkUrl,
    variantSku,
  });
  
  // Cache result
  await redis.setex(cacheKey, 86400, JSON.stringify(preview));
  
  return Response.json(preview);
}
```

### Component Examples

**Product Preview Component:**
```typescript
// src/ui/components/create/ProductPortraitPreview.tsx
'use client';

import Image from 'next/image';

interface ProductPortraitPreviewProps {
  previewUrl: string | null;
  product: AiPortraitProduct;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 200, height: 200 },
  md: { width: 400, height: 400 },
  lg: { width: 600, height: 600 },
  xl: { width: 800, height: 800 },
};

export default function ProductPortraitPreview({
  previewUrl,
  product,
  isLoading = false,
  size = 'md',
  className,
}: ProductPortraitPreviewProps) {
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg ${className}`} 
        style={{ width: sizeMap[size].width, height: sizeMap[size].height }}
      />
    );
  }
  
  if (!previewUrl) {
    // Fallback to product image
    return (
      <div className={className}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            width={sizeMap[size].width}
            height={sizeMap[size].height}
            className="rounded-lg"
          />
        ) : (
          <div className="bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
            style={{ width: sizeMap[size].width, height: sizeMap[size].height }}
          >
            No preview
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Image
      src={previewUrl}
      alt={`${product.title} with your portrait`}
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      className={`rounded-lg ${className}`}
    />
  );
}
```

**AddToCartIsland Updates:**
```typescript
// In AddToCartIsland.tsx - Add preview generation logic

const [previewUrl, setPreviewUrl] = useState<string | null>(
  searchParams.previewUrl ?? null
);
const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

// Generate preview when variant changes
useEffect(() => {
  if (!product.gelatoProductUid || !artworkUrl || !selectedVariant) return;
  
  // Skip if preview URL already exists
  if (previewUrl) return;
  
  generatePreview();
}, [selectedVariantId, product.gelatoProductUid, artworkUrl]);

const generatePreview = async () => {
  if (!product.gelatoProductUid || !artworkUrl || !selectedVariant) return;
  
  setIsGeneratingPreview(true);
  try {
    const response = await fetch('/api/gelato/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productUid: product.gelatoProductUid,
        artworkUrl,
        variantSku: selectedVariant.sku,
      }),
    });
    
    if (!response.ok) throw new Error('Preview generation failed');
    
    const data = await response.json();
    const newPreviewUrl = data.externalPreviewUrl || data.previewUrl;
    
    setPreviewUrl(newPreviewUrl);
    
    // Update URL params
    const newParams = buildCreateFlowQueryString({
      artwork: artworkUrl,
      photo: originalPhotoUrl,
      styleId,
      generationId,
      productHandle: product.handle,
      previewUrl: newPreviewUrl, // Add preview URL
    });
    router.replace(`${window.location.pathname}${newParams}`, { scroll: false });
  } catch (error) {
    console.error('Preview generation failed:', error);
    // Don't block user - preview is optional
  } finally {
    setIsGeneratingPreview(false);
  }
};

// Update buildAttributes to include preview URL
const buildAttributes = useCallback(() => {
  const attributes = [
    { key: 'gelato_print_url', value: artworkUrl },
    { key: 'product_handle', value: product.handle },
  ];
  
  // Add preview URL if available
  if (previewUrl) {
    attributes.push({ key: 'gelato_preview_url', value: previewUrl });
  }
  
  // ... rest of attributes
  return attributes;
}, [artworkUrl, previewUrl, /* ... */]);
```

---

## Alternative Approaches

### Option A: Client-Side Mockup (Simpler, Less Realistic)

**Pros:**
- No API integration needed
- Instant previews
- No additional costs
- Works offline

**Cons:**
- Less realistic previews
- Requires product mockup templates
- Manual positioning logic

**Implementation:**
- Use CSS `background-image` with `background-blend-mode`
- Overlay artwork on product image
- Use Canvas API for more control

### Option B: Third-Party Mockup Service

**Services:**
- Placeit
- Smartmockups API
- Mockup World API

**Pros:**
- Professional mockups
- No Gelato API needed
- May be cheaper

**Cons:**
- Additional service dependency
- May not match Gelato products exactly

---

## Success Criteria

✅ Preview generated ONLY on `/create/order` page  
✅ Preview URL persisted in URL search params  
✅ Preview URL included in cart line item attributes  
✅ Preview updates when variant changes  
✅ Preview generation is fast (< 3 seconds)  
✅ Graceful fallback if preview fails  
✅ No impact on existing fulfillment flow  
✅ Preview URLs are cached appropriately  
✅ Mobile-responsive preview display  
✅ Preview persists through navigation (back/forward)  

---

## Risks & Mitigation

### Risk 1: Gelato API Costs
**Mitigation:** Cache previews aggressively, only generate on-demand

### Risk 2: API Rate Limits
**Mitigation:** Implement request queuing, respect rate limits

### Risk 3: Preview Generation Delays
**Mitigation:** Show loading states, preload for likely selections

### Risk 4: API Availability
**Mitigation:** Fallback to generic product images, retry logic

---

## Next Steps

1. **Research Gelato API**
   - Sign up for Gelato API access
   - Review API documentation
   - Test preview generation endpoint
   - Understand rate limits and pricing

2. **Proof of Concept**
   - Implement basic API client
   - Generate single preview
   - Test with real product and artwork

3. **Implement Core Features**
   - Update CreateFlowParams to include previewUrl
   - API route for preview generation
   - Preview component
   - Update order page to show preview
   - Update AddToCartIsland to generate and persist preview

4. **Cart Integration**
   - Add preview URL to cart attributes
   - Update cart display to show preview
   - Test preview persistence through checkout

5. **Optimize & Polish**
   - Add caching
   - Improve loading states
   - Error handling
   - Mobile optimization

---

## Questions to Answer

1. **Gelato API Access**
   - Do we have Gelato API credentials?
   - What are the rate limits?
   - What are the costs per preview?

2. **Preview Requirements** ✅ **CLARIFIED**
   - ✅ Preview only on `/create/order` page
   - ✅ Preview for selected variant (regenerate when variant changes)
   - ✅ Preview URL stored in URL params and cart attributes

3. **Performance**
   - Acceptable preview generation time?
   - How many concurrent preview requests expected?
   - Cache strategy preferences?

4. **Fallback Strategy**
   - What to show if preview generation fails?
   - Should we pre-generate previews for popular products?

---

## Related Documentation

- [Gelato Shopify Integration](./GELATO_SHOPIFY_INTEGRATION.md)
- [Portrait Preview Analysis](./PORTRAIT_PREVIEW_ANALYSIS.md)
- [Gelato API Documentation](https://dashboard.gelato.com/docs/)
