# Monitoring and Alerting Setup

Complete guide for monitoring, logging, and alerting in production.

---

## Table of Contents

- [Overview](#overview)
- [Sentry Configuration](#sentry-configuration)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Logging](#logging)
- [Alerting](#alerting)
- [Dashboards](#dashboards)

---

## Overview

The application uses **Sentry** for error monitoring and performance tracking. Additional monitoring can be configured via Vercel Analytics, Google Analytics, or custom solutions.

### Monitoring Stack

- **Error Tracking**: Sentry
- **Performance Monitoring**: Sentry Performance (traces)
- **Logging**: Structured logging with Sentry integration
- **Rate Limiting**: Redis-based (monitored via Redis metrics)
- **Uptime**: External service (UptimeRobot, Pingdom, etc.)

---

## Sentry Configuration

### Initial Setup

1. **Create Sentry Project**
   - Go to [sentry.io](https://sentry.io)
   - Create a new project (Next.js)
   - Copy your DSN

2. **Configure Environment Variables**

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

3. **Verify Configuration**

Sentry is automatically configured via:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `next.config.ts` - Source maps upload

### Current Configuration

**Sampling Rates:**
- Traces: `0.1` (10% of transactions)
- Errors: `100%` (all errors captured)

**Environments:**
- Development: `development`
- Production: `production`
- Staging: `staging` (if configured)

**Source Maps:**
- Automatically uploaded during build (when `SENTRY_ORG` and `SENTRY_PROJECT` are set)
- Only in production builds

### Configuration Files

#### Client Config (`sentry.client.config.ts`)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});
```

#### Server Config (`sentry.server.config.ts`)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});
```

### Release Tracking

Releases are automatically tracked when:
- `SENTRY_ORG` and `SENTRY_PROJECT` are set
- Source maps are uploaded during build
- Git commit SHA is included in release

**Manual Release Creation:**

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create release
sentry-cli releases new $VERSION
sentry-cli releases set-commits $VERSION --auto
sentry-cli releases finalize $VERSION
```

---

## Error Tracking

### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- React component errors (Error Boundaries)
- API route errors
- Server-side errors

### Manual Error Reporting

Use the logger utility for structured error reporting:

```typescript
import { logger } from '@/core/utils/logger';

try {
  // Your code
} catch (error) {
  logger.error('Operation failed', {
    error,
    context: 'operation-name',
    metadata: { userId: '123' },
  });
}
```

### Error Context

Add context to errors:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.setUser({ id: '123', email: 'user@example.com' });
Sentry.setTag('operation', 'ai-generation');
Sentry.setContext('request', {
  photoUrl: '...',
  styleId: 'pixar',
});
```

### Filtering Errors

Configure error filtering in Sentry dashboard:
- Ignore specific error types
- Set up rules for error grouping
- Configure alert thresholds

---

## Performance Monitoring

### Transaction Tracking

Sentry automatically tracks:
- Page loads
- API route execution
- Database queries (if configured)
- External API calls

### Custom Transactions

```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'AI Generation',
  op: 'ai.generate',
});

// Your code

transaction.finish();
```

### Performance Metrics

Monitor:
- **Page Load Time** - Time to First Byte (TTFB), First Contentful Paint (FCP)
- **API Response Time** - Endpoint execution time
- **Database Query Time** - Query performance
- **External API Time** - Shopify, OpenAI, UploadThing response times

### Sampling

Current sampling rate: `0.1` (10% of transactions)

**Adjust Sampling:**

```typescript
// In sentry.*.config.ts
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

---

## Logging

### Structured Logging

Use the logger utility for consistent logging:

```typescript
import { logger } from '@/core/utils/logger';

logger.info('Operation started', { context: 'operation-name' });
logger.warn('Deprecated API used', { endpoint: '/api/old' });
logger.error('Operation failed', { error, context: 'operation-name' });
```

### Log Levels

- **Debug**: Development-only logs (removed in production builds)
- **Info**: General information
- **Warn**: Warnings
- **Error**: Errors (captured by Sentry)

### Log Context

Always include context:

```typescript
logger.error('Failed to generate portrait', {
  error,
  context: 'ai-generation',
  metadata: {
    photoUrl: '...',
    styleId: 'pixar',
    userId: '123',
  },
});
```

### Production Logging

- Debug logs are removed in production builds (`next.config.ts`)
- Only `error` and `warn` console logs are kept
- All errors are sent to Sentry

---

## Alerting

### Sentry Alerts

Configure alerts in Sentry dashboard:

1. **Go to Alerts** → **Create Alert Rule**

2. **Alert Conditions:**
   - Error rate threshold (e.g., > 10 errors/minute)
   - Performance degradation (e.g., P95 > 2s)
   - New issue detected
   - Issue frequency threshold

3. **Notification Channels:**
   - Email
   - Slack
   - PagerDuty
   - Microsoft Teams
   - Webhooks

### Recommended Alerts

#### Critical Errors

- **Condition**: Error rate > 20 errors/minute
- **Action**: Immediate notification (PagerDuty, Slack)
- **Threshold**: 5 minutes

#### Performance Degradation

- **Condition**: P95 response time > 3 seconds
- **Action**: Email + Slack notification
- **Threshold**: 10 minutes

#### New Critical Issues

- **Condition**: New issue with level "error" or "fatal"
- **Action**: Email notification
- **Threshold**: Immediate

#### Rate Limit Exceeded

- **Condition**: 429 errors > 100/minute
- **Action**: Slack notification
- **Threshold**: 5 minutes

### External Monitoring

#### Uptime Monitoring

Configure external uptime monitoring:
- **UptimeRobot**: Free tier available
- **Pingdom**: Commercial solution
- **StatusCake**: Free tier available

**Endpoints to Monitor:**
- `https://yourdomain.com` - Homepage
- `https://yourdomain.com/api/health` - Health check (if implemented)
- `https://yourdomain.com/api/cart` - Critical API endpoint

#### Health Checks

Create a health check endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    shopify: await checkShopify(),
  };

  const healthy = Object.values(checks).every(Boolean);

  return Response.json({ healthy, checks }, {
    status: healthy ? 200 : 503,
  });
}
```

---

## Dashboards

### Sentry Dashboard

Create custom dashboards in Sentry:

1. **Error Rate** - Errors per minute/hour
2. **Performance** - Response times, throughput
3. **User Impact** - Affected users, sessions
4. **Release Health** - Errors by release

### Custom Metrics

Track custom metrics:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.metrics.increment('ai.generation.started', 1, {
  tags: { style: 'pixar' },
});

Sentry.metrics.distribution('ai.generation.duration', duration, {
  unit: 'millisecond',
  tags: { style: 'pixar' },
});
```

### Vercel Analytics

Enable Vercel Analytics in project settings:
- Web Vitals tracking
- Real-time analytics
- Performance insights

---

## Best Practices

### 1. Error Context

Always include context when logging errors:

```typescript
// Good
logger.error('Failed to generate portrait', {
  error,
  context: 'ai-generation',
  metadata: { photoUrl, styleId, userId },
});

// Bad
logger.error('Failed');
```

### 2. Performance Monitoring

Track slow operations:

```typescript
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow operation', {
    operation: 'ai-generation',
    duration,
  });
}
```

### 3. User Identification

Set user context for better error tracking:

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

### 4. Release Tracking

Always tag releases with version numbers:

```bash
# In CI/CD
export SENTRY_RELEASE=$(git rev-parse HEAD)
```

### 5. Sampling Strategy

- **Errors**: 100% (capture all errors)
- **Traces**: 10% (sample performance data)
- **Custom Metrics**: As needed

---

## Troubleshooting

### Sentry Not Receiving Errors

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify `SENTRY_ORG` and `SENTRY_PROJECT` are set
3. Check Sentry dashboard for project status
4. Verify source maps are uploaded

### High Error Volume

1. Review error grouping rules
2. Filter out noise (browser extensions, bots)
3. Adjust sampling rates
4. Set up alert thresholds

### Performance Issues

1. Review slow transactions in Sentry
2. Check database query performance
3. Monitor external API response times
4. Review bundle sizes

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [API Documentation](./API.md) - API endpoints
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Runbook](./RUNBOOK.md) - Operational procedures
