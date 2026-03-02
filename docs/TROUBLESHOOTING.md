# Troubleshooting Guide

Common issues and solutions for the PetPortrait AI ecommerce platform.

---

## Table of Contents

- [Deployment Issues](#deployment-issues)
- [Environment Variables](#environment-variables)
- [API Errors](#api-errors)
- [Authentication Issues](#authentication-issues)
- [Shopify Integration](#shopify-integration)
- [AI Generation](#ai-generation)
- [Performance Issues](#performance-issues)
- [Rate Limiting](#rate-limiting)
- [Monitoring](#monitoring)

---

## Deployment Issues

### Build Fails

**Symptoms:**
- Build fails during `yarn build`
- TypeScript errors
- Missing dependencies

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 20+
   ```

2. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules .next
   yarn install
   yarn build
   ```

3. **Check TypeScript errors:**
   ```bash
   yarn type-check
   ```

4. **Verify environment variables:**
   ```bash
   # Check required variables are set
   yarn dev  # Will show validation errors
   ```

### Deployment Succeeds but Site Doesn't Load

**Symptoms:**
- Deployment completes successfully
- Site returns 500 error or blank page

**Solutions:**

1. **Check environment variables:**
   - Verify all required variables are set in deployment platform
   - Check for typos in variable names

2. **Check Sentry for errors:**
   - Review Sentry dashboard for runtime errors
   - Check for missing environment variables

3. **Check build logs:**
   - Review deployment logs for warnings
   - Verify source maps uploaded correctly

4. **Test locally:**
   ```bash
   yarn build
   yarn start
   # Test at http://localhost:3000
   ```

---

## Environment Variables

### Missing Required Variables

**Symptoms:**
- Application won't start
- Error messages about missing variables

**Solutions:**

1. **Check validation output:**
   ```bash
   yarn dev  # Shows validation errors
   ```

2. **Review `.env.example`:**
   - Compare with your `.env.local` or production variables
   - Ensure all required variables are set

3. **Verify variable names:**
   - Check for typos (e.g., `NEXT_PUBLIC_BASE_URL` vs `NEXT_PUBLIC_BASEURL`)
   - Ensure no extra spaces or quotes

### Production Validation Fails

**Symptoms:**
- App starts in development but fails in production
- Admin routes not protected

**Solutions:**

1. **Check production-specific requirements:**
   - `ADMIN_BASIC_USER` + `ADMIN_BASIC_PASSWORD` OR `ADMIN_SECRET` must be set
   - Verify `NODE_ENV=production` is set

2. **Review validation warnings:**
   - Check startup logs for warnings
   - Address recommended variables (Sentry, Redis)

---

## API Errors

### 401 Unauthorized

**Symptoms:**
- API returns 401 Unauthorized
- Authentication errors

**Solutions:**

1. **Check authentication method:**
   ```bash
   # Verify Bearer token
   curl -H "Authorization: Bearer $AI_API_SECRET" \
     https://yourdomain.com/api/ai/generate
   ```

2. **Verify environment variables:**
   - `AI_API_SECRET` for `/api/ai/generate`
   - `UPLOADTHING_API_SECRET` for `/api/uploadthing`
   - `ADMIN_SECRET` or `ADMIN_BASIC_USER`/`ADMIN_BASIC_PASSWORD` for admin routes

3. **Check session cookies:**
   - For browser requests, ensure session cookies are present
   - Clear cookies and retry

### 403 Forbidden

**Symptoms:**
- API returns 403 Forbidden
- Cross-origin request blocked

**Solutions:**

1. **Use Bearer token for cross-origin requests:**
   ```bash
   curl -H "Authorization: Bearer $AI_API_SECRET" \
     https://yourdomain.com/api/ai/generate
   ```

2. **Verify CORS configuration:**
   - Check `next.config.ts` for CSP headers
   - Ensure request origin matches allowed origins

### 429 Too Many Requests

**Symptoms:**
- Rate limit exceeded errors
- `Retry-After` header present

**Solutions:**

1. **Wait for rate limit window:**
   - Check `Retry-After` header value
   - Wait before retrying

2. **Check rate limit configuration:**
   - Verify `REDIS_URL` is set (for distributed rate limiting)
   - Review `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

3. **Review rate limit logs:**
   - Check Redis for rate limit keys
   - Verify IP identification is working correctly

### 500 Internal Server Error

**Symptoms:**
- Generic server errors
- No specific error message

**Solutions:**

1. **Check Sentry for error details:**
   - Review Sentry dashboard for stack traces
   - Check error context and metadata

2. **Review server logs:**
   - Check deployment platform logs
   - Look for unhandled exceptions

3. **Verify external services:**
   - Check Shopify API status
   - Verify OpenAI API is accessible
   - Check UploadThing service status

---

## Authentication Issues

### Admin Routes Not Protected

**Symptoms:**
- Admin routes accessible without authentication
- No 401/403 errors

**Solutions:**

1. **Verify production environment:**
   ```bash
   echo $NODE_ENV  # Should be "production"
   ```

2. **Check admin auth configuration:**
   - `ADMIN_BASIC_USER` + `ADMIN_BASIC_PASSWORD` OR `ADMIN_SECRET` must be set
   - Verify variables are set in production environment

3. **Test authentication:**
   ```bash
   # Should return 401 without auth
   curl https://yourdomain.com/admin
   
   # Should work with auth
   curl -u "admin:password" https://yourdomain.com/admin
   ```

### Session-Based Auth Not Working

**Symptoms:**
- Browser requests fail with 401
- Session cookies not being issued

**Solutions:**

1. **Check cookie configuration:**
   - Verify `getStandardCookieOptions()` is used
   - Check cookie security settings

2. **Verify same-origin requests:**
   - Ensure requests are from same domain
   - Check for CORS issues

3. **Clear cookies and retry:**
   - Clear browser cookies
   - Retry request

---

## Shopify Integration

### Shopify API Errors

**Symptoms:**
- Failed to fetch products
- Cart operations fail
- GraphQL errors

**Solutions:**

1. **Verify Shopify credentials:**
   - Check `SHOPIFY_STORE_FRONT_ACCESS_TOKEN` is valid
   - Verify `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` are correct

2. **Check Shopify API status:**
   - Visit [Shopify Status](https://status.shopify.com/)
   - Verify store is accessible

3. **Review GraphQL queries:**
   - Check query syntax
   - Verify required fields are requested

4. **Check OAuth token refresh:**
   - Admin API tokens expire after 24 hours
   - Verify token refresh is working

### Gelato Integration Issues

**Symptoms:**
- Orders not being fulfilled
- Missing `gelato_print_url` attribute

**Solutions:**

1. **Verify Gelato app is installed:**
   - Check Shopify Admin → Apps
   - Ensure Gelato app is active

2. **Check cart attributes:**
   - Verify `gelato_print_url` is included in cart line items
   - Ensure URL is public and permanent

3. **Review product configuration:**
   - Check product variants have SKUs
   - Verify `gelato.productUid` metafield is set

See [docs/GELATO_SHOPIFY_INTEGRATION.md](./GELATO_SHOPIFY_INTEGRATION.md) for details.

---

## AI Generation

### OpenAI API Errors

**Symptoms:**
- AI generation fails
- Timeout errors
- Invalid image errors

**Solutions:**

1. **Verify OpenAI API key:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Check API credits:**
   - Verify OpenAI account has credits
   - Check usage limits

3. **Validate image URL:**
   - Ensure image URL is accessible
   - Check image format (JPEG, PNG)
   - Verify image size is reasonable

4. **Check rate limits:**
   - OpenAI has rate limits per account
   - Review OpenAI dashboard for usage

### Image Validation Fails

**Symptoms:**
- "Invalid image" error
- Image URL not accessible

**Solutions:**

1. **Verify image URL:**
   ```bash
   curl -I https://cdn.example.com/image.jpg
   # Should return 200 OK
   ```

2. **Check image format:**
   - Supported: JPEG, PNG, WebP
   - Verify Content-Type header

3. **Review image size:**
   - Check file size (should be reasonable)
   - Verify image dimensions

---

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Pages load slowly
- High Time to First Byte (TTFB)

**Solutions:**

1. **Check Sentry Performance:**
   - Review slow transactions
   - Identify bottlenecks

2. **Review external API calls:**
   - Check Shopify API response times
   - Verify OpenAI API latency

3. **Check caching:**
   - Verify Redis is configured
   - Review cache hit rates

4. **Optimize images:**
   - Use Next.js Image component
   - Verify image optimization is enabled

### High Memory Usage

**Symptoms:**
- Server memory warnings
- OOM errors

**Solutions:**

1. **Review bundle size:**
   ```bash
   yarn build
   # Check .next/analyze output
   ```

2. **Check for memory leaks:**
   - Review Sentry for memory-related errors
   - Check for unclosed connections

3. **Optimize dependencies:**
   - Remove unused dependencies
   - Use dynamic imports for large libraries

---

## Rate Limiting

### Rate Limiting Not Working

**Symptoms:**
- Rate limits not enforced
- Multiple requests allowed

**Solutions:**

1. **Verify Redis configuration:**
   ```bash
   # Check Redis connection
   redis-cli -u $REDIS_URL ping
   ```

2. **Check rate limit configuration:**
   - Verify `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
   - Review rate limit implementation

3. **Test rate limiting:**
   ```bash
   # Make multiple rapid requests
   for i in {1..10}; do
     curl https://yourdomain.com/api/ai/generate
   done
   # Should get 429 after limit
   ```

### Redis Connection Issues

**Symptoms:**
- Rate limiting falls back to in-memory
- Redis connection errors

**Solutions:**

1. **Verify Redis URL:**
   ```bash
   echo $REDIS_URL
   # Should be valid Redis URL
   ```

2. **Test Redis connection:**
   ```bash
   redis-cli -u $REDIS_URL ping
   # Should return PONG
   ```

3. **Check Redis instance:**
   - Verify Redis instance is running
   - Check network connectivity
   - Review Redis logs

See [docs/REDIS_SETUP.md](./REDIS_SETUP.md) for details.

---

## Monitoring

### Sentry Not Receiving Errors

**Symptoms:**
- Errors not appearing in Sentry
- No error tracking

**Solutions:**

1. **Verify Sentry configuration:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   echo $SENTRY_ORG
   echo $SENTRY_PROJECT
   ```

2. **Check Sentry initialization:**
   - Verify Sentry config files are correct
   - Check `enabled` flag is true

3. **Test error reporting:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   Sentry.captureException(new Error('Test error'));
   ```

4. **Check source maps:**
   - Verify source maps are uploaded
   - Check build logs for upload status

### Missing Performance Data

**Symptoms:**
- No performance traces in Sentry
- Missing transaction data

**Solutions:**

1. **Check sampling rate:**
   - Verify `tracesSampleRate` is > 0
   - Current: 0.1 (10%)

2. **Verify transaction tracking:**
   - Check transactions are being created
   - Review Sentry dashboard for traces

3. **Review performance settings:**
   - Check Sentry project settings
   - Verify performance monitoring is enabled

---

## Getting Help

If issues persist:

1. **Check logs:**
   - Review deployment platform logs
   - Check Sentry for error details

2. **Review documentation:**
   - [Deployment Guide](../DEPLOYMENT.md)
   - [API Documentation](./API.md)
   - [Monitoring Guide](./MONITORING.md)

3. **Create issue:**
   - Include error messages
   - Provide reproduction steps
   - Include relevant logs

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [API Documentation](./API.md) - API endpoints
- [Monitoring Guide](./MONITORING.md) - Monitoring setup
- [Runbook](./RUNBOOK.md) - Operational procedures
