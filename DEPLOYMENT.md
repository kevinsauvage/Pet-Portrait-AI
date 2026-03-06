# Deployment Guide

This guide covers deploying the PetPortrait AI ecommerce platform to production environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Platforms](#deployment-platforms)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Verification](#post-deployment-verification)
- [Environment-Specific Notes](#environment-specific-notes)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 20+ installed
- ✅ All required environment variables configured (see [Environment Setup](#environment-setup))
- ✅ Shopify store configured with Gelato app installed
- ✅ OpenAI API key with sufficient credits
- ✅ UploadThing account configured
- ✅ Sentry account (recommended for production)
- ✅ Redis instance (required for production when using multiple server instances)
- ✅ Domain name configured (if using custom domain)

---

## Environment Setup

### Required Environment Variables

All required variables must be set before deployment. See `.env.example` for complete list.

#### Core Configuration

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL=https://your-store.myshopify.com/api/2025-01/graphql.json
SHOPIFY_STORE_FRONT_ACCESS_TOKEN=your_storefront_token
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_ADMIN_URL=https://your-store.myshopify.com/admin/api/2025-01/graphql.json
OPENAI_API_KEY=sk-...
UPLOADTHING_TOKEN=sk_live_...
UPLOADTHING_SECRET=sk_live_...
```

#### Recommended for Production

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

#### Required for Production (Multiple Instances)

```env
# Redis is REQUIRED when running multiple server instances (e.g., Vercel, serverless)
# Without Redis, rate limits are stored in-memory per instance and are not shared,
# which means rate limiting will not work correctly in multi-instance deployments.
REDIS_URL=redis://...
```

#### Optional Security

```env
AI_API_SECRET=secret_for_ai_endpoint
UPLOADTHING_API_SECRET=secret_for_upload_endpoint
```

### Environment Validation

The application validates environment variables on startup:

- **Errors** (blocking): Missing required variables prevent startup
- **Warnings** (non-blocking): Missing recommended variables show warnings but allow startup
- **Production checks**: Additional validations run when `NODE_ENV=production`

To check configuration status:

```typescript
import { getConfigStatus } from '@/core/config/validation';
const status = getConfigStatus();
console.log(status);
```

---

## Deployment Platforms

### Vercel (Recommended)

Vercel provides seamless Next.js deployment with built-in optimizations.

#### Setup Steps

1. **Connect Repository**
   - Import your Git repository in Vercel dashboard
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables (see [Environment Setup](#environment-setup))
   - Set variables for Production, Preview, and Development environments

3. **Configure Build Settings**
   - Build Command: `yarn build` (or `npm run build`)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `yarn install` (or `npm install`)

4. **Add Redis Integration** (Recommended)
   - Go to Project Settings → Integrations
   - Add Redis integration (Upstash, Redis Cloud, etc.)
   - `REDIS_URL` will be automatically set

5. **Configure Sentry** (Recommended)
   - Add `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
   - Source maps will be uploaded automatically during build

6. **Deploy**
   - Push to `main` branch triggers production deployment
   - Preview deployments created for pull requests

#### Vercel-Specific Configuration

- **Edge Functions**: Automatically configured for API routes
- **Serverless Functions**: API routes run as serverless functions
- **CDN**: Static assets and pages automatically cached
- **Analytics**: Enable Vercel Analytics in project settings

### Other Platforms

#### Netlify

1. Connect repository
2. Build command: `yarn build`
3. Publish directory: `.next`
4. Add environment variables in site settings
5. Configure Redis and Sentry manually

#### Self-Hosted (Docker)

See `Dockerfile` example:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["yarn", "start"]
```

---

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All required environment variables are set
- [ ] Sentry is configured (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`)
- [ ] Redis is configured (`REDIS_URL`) for distributed rate limiting (required when using multiple server instances)
- [ ] API protection secrets are set (`AI_API_SECRET`, `UPLOADTHING_API_SECRET`)
- [ ] Build succeeds without errors (`yarn build`)
- [ ] All tests pass (`yarn test`)
- [ ] Type checking passes (`yarn type-check`)
- [ ] Linting passes (`yarn lint`)
- [ ] GraphQL codegen runs successfully (`yarn codegen`)
- [ ] Shopify store is configured and Gelato app is installed
- [ ] OpenAI API key has sufficient credits
- [ ] UploadThing account is active
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is valid (if self-hosting)
- [ ] Monitoring and alerting are configured
- [ ] Rollback plan is documented (see [docs/ROLLBACK.md](./docs/ROLLBACK.md))

---

## Deployment Steps

### 1. Pre-Deployment

```bash
# Ensure you're on the correct branch
git checkout main
git pull origin main

# Run pre-deployment checks
yarn install
yarn lint
yarn type-check
yarn test
yarn build
```

### 2. Deploy

**Vercel:**

- Push to `main` branch (automatic deployment)
- Or use Vercel CLI: `vercel --prod`

**Manual:**

```bash
# Build production bundle
yarn build

# Start production server
yarn start
```

### 3. Verify Deployment

See [Post-Deployment Verification](#post-deployment-verification)

---

## Post-Deployment Verification

After deployment, verify:

### 1. Health Checks

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] API routes respond: `https://yourdomain.com/api/health` (if implemented)
- [ ] Static assets load correctly
- [ ] Images load from CDN (UploadThing, Shopify)

### 2. Core Functionality

- [ ] User can upload a photo
- [ ] AI generation endpoint works (`/api/ai/generate`)
- [ ] Products load from Shopify
- [ ] Cart functionality works
- [ ] Checkout redirects to Shopify checkout

### 3. Authentication

- [ ] Admin routes are protected (`/admin/*`)
- [ ] API endpoints are protected (if secrets configured)
- [ ] Session-based auth works for browser flows

### 4. Monitoring

- [ ] Sentry is receiving errors (check Sentry dashboard)
- [ ] Rate limiting is working (check Redis if configured)
- [ ] Performance metrics are being tracked

### 5. Security

- [ ] Security headers are present (check with browser dev tools)
- [ ] HTTPS is enforced
- [ ] No sensitive data in client-side code

### Verification Script

```bash
# Check environment variables
curl https://yourdomain.com/api/health

# Test AI generation (requires auth)
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "Authorization: Bearer $AI_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"originalPhotoUrl":"...","styleId":"pixar"}'

# Check admin protection
curl https://yourdomain.com/admin
# Should return 401 Unauthorized without credentials
```

---

## Environment-Specific Notes

### Development

- Only required variables needed
- Admin auth optional (defaults to allowing access)
- Debug logging enabled
- Source maps enabled

### Staging

- All required variables
- Recommended variables (Sentry, Redis) for testing
- Admin auth recommended
- Production-like configuration
- Use staging Shopify store if available

### Production

- All required variables
- All production-required variables (admin auth)
- All recommended variables (Sentry)
- Redis (`REDIS_URL`) is required when using multiple server instances (e.g., Vercel, serverless)
- Optional variables as needed
- Debug logging disabled
- Source maps uploaded to Sentry only

---

## Troubleshooting

See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common deployment issues.

---

## Rollback Procedures

If deployment fails or issues are discovered:

See [docs/ROLLBACK.md](./docs/ROLLBACK.md) for detailed rollback procedures.

---

## Related Documentation

- [Environment Variables](./README.md#environment-variables) - Complete environment variable reference
- [API Documentation](./docs/API.md) - API endpoints and authentication
- [Monitoring Guide](./docs/MONITORING.md) - Monitoring and alerting setup
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Runbook](./docs/RUNBOOK.md) - Operational procedures
- [Rollback Guide](./docs/ROLLBACK.md) - Rollback procedures
