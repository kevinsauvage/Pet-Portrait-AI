# Request Size Validation

This document explains how request size limits are enforced and their limitations.

## Overview

The application enforces size limits on incoming requests to prevent abuse and ensure system stability. However, there are important limitations to be aware of.

## Current Implementation

### JSON Requests (`/api/ai/generate`)

**Limit:** 256KB

**Validation:**
1. **Content-Length header check** - Initial validation using `enforceRequestSizeLimit()`
2. **Actual body size check** - After parsing JSON, validates actual body size using `enforceBodySizeLimit()`

**Why both checks?**
- Content-Length check provides early rejection for obviously oversized requests
- Body size check validates actual payload size, preventing spoofed Content-Length headers

**Example:**
```typescript
// Initial check (can be spoofed)
const sizeError = enforceRequestSizeLimit(request, { scope: 'ai' });
if (sizeError) return sizeError;

// Parse body
const body = await request.json();

// Actual size check (reliable)
const bodySizeError = enforceBodySizeLimit(body, { scope: 'ai' });
if (bodySizeError) return bodySizeError;
```

### File Uploads (`/api/uploadthing`)

**Limit:** 64MB (total request size)

**Validation:**
- Content-Length header check only
- UploadThing enforces its own per-file limits (8MB per file)

**Why only Content-Length?**
- File uploads are streamed, making it impractical to check body size before processing
- UploadThing SDK enforces stricter per-file limits (8MB) which provides additional protection
- The 64MB limit is a reasonable upper bound for the entire multipart request

**UploadThing Limits:**
- Per file: 8MB (configured in `src/infra/upload/core.ts`)
- File types: Images only (JPEG, PNG, WebP)
- Max files per upload: Varies by endpoint (1-6 files)

## Limitations

### Content-Length Header Can Be Spoofed

**Issue:** Malicious clients can:
- Omit the `Content-Length` header
- Set an incorrect `Content-Length` value
- Send more data than declared

**Impact:**
- For JSON requests: Mitigated by actual body size validation after parsing
- For file uploads: UploadThing's own limits provide protection

**Mitigation:**
- JSON requests: Use `enforceBodySizeLimit()` after parsing
- File uploads: Rely on UploadThing's built-in limits and streaming validation

### Streaming Uploads

**Issue:** For streaming uploads (multipart/form-data), we cannot check body size before reading the entire stream.

**Impact:**
- Initial Content-Length check may be bypassed
- Large uploads consume server resources before being rejected

**Mitigation:**
- UploadThing SDK validates file sizes during upload
- Per-file limits (8MB) are enforced by UploadThing
- Server has reasonable timeout limits

## Best Practices

### For JSON Endpoints

Always validate actual body size after parsing:

```typescript
// ✅ Good: Double validation
const headerCheck = enforceRequestSizeLimit(request, { scope: 'ai' });
if (headerCheck) return headerCheck;

const body = await request.json();
const bodyCheck = enforceBodySizeLimit(body, { scope: 'ai' });
if (bodyCheck) return bodyCheck;
```

### For File Upload Endpoints

Rely on Content-Length check and UploadThing limits:

```typescript
// ✅ Good: Header check + UploadThing limits
const sizeError = enforceRequestSizeLimit(request, { scope: 'upload' });
if (sizeError) return sizeError;

// UploadThing will enforce per-file limits
return uploadthingHandler.POST(request);
```

## Configuration

Size limits are defined in `src/core/utils/request-size.ts`:

```typescript
const REQUEST_SIZE_LIMITS: Record<RequestSizeScope, number> = {
  ai: 256 * 1024,        // 256KB for JSON requests
  upload: 64 * 1024 * 1024, // 64MB for file uploads
};
```

UploadThing per-file limits are configured in `src/infra/upload/core.ts`:

```typescript
f({ image: { maxFileSize: '8MB', maxFileCount } })
```

## Related Documentation

- [API Documentation](./API.md) — API endpoints and behavior
- Upload limits are also constrained by `shop_config.image` where server-side validation runs; see [Shop configuration](./SHOP_CONFIG.md)
