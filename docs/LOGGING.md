# Logging Standards and Best Practices

Complete guide for logging in the application, including structured logging, request tracking, and performance monitoring.

---

## Table of Contents

- [Overview](#overview)
- [Logger API](#logger-api)
- [Structured Logging](#structured-logging)
- [Request ID Tracking](#request-id-tracking)
- [Performance Logging](#performance-logging)
- [Log Levels](#log-levels)
- [Best Practices](#best-practices)
- [Log Retention Policies](#log-retention-policies)
- [Migration Guide](#migration-guide)

---

## Overview

The application uses a structured logging system with:

- **Server (Pino)**: JSON logs to stdout from `@/core/utils/logger.server` (API routes, services, infra)
- **Client (console)**: Same API from `@/core/utils/logger` in `'use client'` code (avoids bundling Pino)
- **Structured Logging**: Context-aware logging with metadata
- **Request ID Tracking**: Automatic request tracing via AsyncLocalStorage
- **Performance Monitoring**: Built-in slow operation detection
- **Sentry Integration**: Automatic error capture and context
- **Log Level Control**: Environment-based log filtering

### Key Features

- ✅ Automatic request ID inclusion in all logs
- ✅ Structured metadata support
- ✅ Performance threshold monitoring
- ✅ Sensitive data sanitization
- ✅ Sentry error capture with context
- ✅ Environment-based log level control

---

## Logger API

### Import paths

| Where                         | Module                         | Output                                      |
| ----------------------------- | ------------------------------ | ------------------------------------------- |
| Server (routes, services, infra) | `@/core/utils/logger.server`   | **Pino** JSON lines (stdout / log shipping) |
| `'use client'` / browser-only | `@/core/utils/logger`          | Console (same sanitization + Sentry rules)  |
| `api-responses`, `core/config/validation` | `@/core/utils/logger` | Same console logger (imported from Edge middleware and client-bundled config; no `server-only` / Pino) |

### Basic Usage (server)

```typescript
import { logger } from '@/core/utils/logger.server';

// Info log
logger.info('Operation started', {
  context: 'ai-generation',
  metadata: { styleId: 'pixar', userId: '123' },
});

// Warning log
logger.warn('Deprecated API used', {
  context: 'api-client',
  metadata: { endpoint: '/api/old' },
});

// Error log
logger.error('Operation failed', {
  context: 'ai-generation',
  error,
  metadata: { photoUrl: '[REDACTED]', styleId: 'pixar' },
});

// Debug log (development only)
logger.debug('Detailed operation info', {
  context: 'ai-generation',
  metadata: { step: 'image-validation' },
});
```

### Backward Compatibility

The logger supports both old and new API formats:

```typescript
// Old API (still supported)
logger.warn('context-name', error);
logger.error('context-name', error);

// New API (recommended)
logger.warn('Warning message', { context: 'context-name', error });
logger.error('Error message', { context: 'context-name', error, metadata: {...} });
```

---

## Structured Logging

### Log Context Structure

All log methods accept a `LogContext` object:

```typescript
type LogContext = {
  context?: string;        // Context identifier (e.g., 'ai-generation')
  metadata?: Record<string, unknown>;  // Additional structured data
  error?: unknown;         // Error object (for error/warn logs)
};
```

### Examples

#### Basic Context

```typescript
logger.info('User logged in', {
  context: 'auth',
  metadata: { userId: '123', method: 'oauth' },
});
```

#### Error with Context

```typescript
try {
  await generatePortrait(photoUrl, styleId);
} catch (error) {
  logger.error('Portrait generation failed', {
    context: 'ai-generation',
    error,
    metadata: {
      photoUrl: '[REDACTED]',
      styleId: 'pixar',
      userId: '123',
    },
  });
}
```

#### Warning with Metadata

```typescript
logger.warn('Rate limit approaching', {
  context: 'rate-limit',
  metadata: {
    current: 95,
    limit: 100,
    window: '1m',
  },
});
```

---

## Request ID Tracking

Request IDs are automatically included in all logs when using `withRequestContext` wrapper.

### API Routes

Wrap your API route handlers with `withRequestContext`:

```typescript
import { withRequestContext } from '@/core/utils/api-wrapper';

export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    // All logs in this handler will include request ID
    logger.info('Processing request', {
      context: 'api-handler',
      metadata: { endpoint: '/api/ai/generate' },
    });
    
    // ... handler code ...
  });
}
```

### Manual Context Setup

For non-API contexts, use `runWithRequestContextAsync`:

```typescript
import { runWithRequestContextAsync } from '@/core/utils/request-context';

await runWithRequestContextAsync(
  {
    path: '/some/path',
    method: 'POST',
    ip: '192.168.1.1',
  },
  async () => {
    // All logs here will include request ID
    logger.info('Processing background job');
  }
);
```

### Accessing Request Context

```typescript
import { getRequestContext } from '@/core/utils/request-context';

const context = getRequestContext();
if (context) {
  console.log(`Request ID: ${context.requestId}`);
  console.log(`Path: ${context.path}`);
  console.log(`Duration: ${Date.now() - context.startTime}ms`);
}
```

---

## Performance Logging

Use `createPerformanceLogger` to track slow operations:

```typescript
import { createPerformanceLogger } from '@/core/utils/logger.server';

export async function generatePortrait(photoUrl: string, styleId: string) {
  const perf = createPerformanceLogger('ai.generate', 2000); // Threshold: 2s

  try {
    // ... operation ...
    const result = await callAI(photoUrl, styleId);
    
    perf.end({ styleId, success: true });
    return result;
  } catch (error) {
    perf.end({ success: false });
    throw error;
  }
}
```

### Performance Logger API

```typescript
const perf = createPerformanceLogger(context: string, thresholdMs?: number);

// End operation and log if slow
perf.end(metadata?: Record<string, unknown>): number;

// Get current duration without logging
const duration = perf.getDuration();

// Access request ID
const requestId = perf.requestId;
```

### Behavior

- If operation takes longer than `thresholdMs`, logs a warning
- If operation completes quickly, logs debug info (development only)
- Always returns duration in milliseconds
- Includes request ID in performance logs

---

## Log Levels

### Environment Variable

Set `LOG_LEVEL` environment variable to control logging:

```env
LOG_LEVEL=debug  # Development
LOG_LEVEL=info   # Production (default)
LOG_LEVEL=warn   # Production (minimal)
LOG_LEVEL=error  # Production (errors only)
```

### Level Hierarchy

```
debug < info < warn < error
```

### Level Behavior

- **debug**: Only in development, always disabled in production
- **info**: General information (default in production)
- **warn**: Warnings that don't stop execution
- **error**: Errors that should be investigated

### Production Defaults

- Debug logs: **Always disabled** (even if LOG_LEVEL=debug)
- Info logs: **Enabled** (unless LOG_LEVEL=warn or error)
- Warn/Error logs: **Always enabled**

---

## Best Practices

### 1. Always Include Context

```typescript
// ✅ Good
logger.error('Failed to generate portrait', {
  context: 'ai-generation',
  error,
  metadata: { styleId: 'pixar' },
});

// ❌ Bad
logger.error('Failed');
```

### 2. Sanitize Sensitive Data

The logger automatically sanitizes:
- API keys and secrets
- Passwords
- Email addresses
- Long tokens (32+ chars)

Always redact sensitive URLs or data manually:

```typescript
logger.info('Processing image', {
  context: 'image-processing',
  metadata: {
    photoUrl: '[REDACTED]', // Manual redaction
    styleId: 'pixar',
  },
});
```

### 3. Use Appropriate Log Levels

```typescript
// ✅ Debug: Detailed information (development only)
logger.debug('Validating image format', { context: 'validation' });

// ✅ Info: General information
logger.info('User logged in', { context: 'auth', metadata: { userId: '123' } });

// ✅ Warn: Non-critical issues
logger.warn('Rate limit approaching', { context: 'rate-limit' });

// ✅ Error: Critical errors
logger.error('Database connection failed', { context: 'database', error });
```

### 4. Include Request Context

Always wrap API handlers with `withRequestContext`:

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    // Handler code
  });
}

// ❌ Bad
export async function POST(request: NextRequest) {
  // Handler code without request context
}
```

### 5. Track Performance for Slow Operations

```typescript
// ✅ Good
const perf = createPerformanceLogger('external-api-call', 1000);
const result = await callExternalAPI();
perf.end({ endpoint: '/api/external' });

// ❌ Bad
const result = await callExternalAPI(); // No performance tracking
```

### 6. Structured Metadata

Use consistent metadata keys:

```typescript
// ✅ Good
logger.info('Cart updated', {
  context: 'cart',
  metadata: {
    cartId: 'cart-123',
    action: 'add-item',
    itemId: 'item-456',
    quantity: 2,
  },
});

// ❌ Bad
logger.info('Cart updated', {
  context: 'cart',
  metadata: {
    cart: 'cart-123',      // Inconsistent naming
    what: 'add-item',      // Unclear key
  },
});
```

### 7. Error Context

Always include error objects and context:

```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', {
    context: 'operation-name',
    error,
    metadata: {
      input: sanitizedInput,
      step: 'validation',
    },
  });
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  logger.error('Failed', { context: 'operation' }); // Missing error object
}
```

---

## Log Retention Policies

### Production Logs

**Platform**: Vercel (or your hosting provider)

- **Retention**: 30 days (default)
- **Storage**: Platform-managed logs
- **Access**: Via Vercel dashboard or CLI

### Sentry Logs

**Platform**: Sentry

- **Retention**: Based on Sentry plan
  - Free tier: 30 days
  - Team tier: 90 days
  - Business tier: 1 year
- **Storage**: Sentry cloud
- **Access**: Via Sentry dashboard

### Local Development

- **Retention**: No retention (console output only)
- **Storage**: Terminal/console
- **Access**: Development terminal

### Log Aggregation

If using external log aggregation (e.g., Datadog, LogRocket):

- Configure retention per service
- Set up log rotation policies
- Archive old logs to cold storage
- Comply with data retention regulations (GDPR, etc.)

### Best Practices

1. **Don't log sensitive data**: Always sanitize
2. **Set appropriate retention**: Balance cost vs. debugging needs
3. **Archive important logs**: Export critical error logs
4. **Monitor log volume**: Alert on excessive logging
5. **Review retention policies**: Regularly audit log storage

---

## Migration Guide

### Migrating from Old API

#### Before

```typescript
logger.warn('context-name', error);
logger.error('context-name', error);
```

#### After

```typescript
logger.warn('Warning message', {
  context: 'context-name',
  error,
});

logger.error('Error message', {
  context: 'context-name',
  error,
  metadata: { additional: 'data' },
});
```

### Adding Request Context

#### Before

```typescript
export async function POST(request: NextRequest) {
  try {
    // Handler code
  } catch (error) {
    logger.error('handler', error);
  }
}
```

#### After

```typescript
import { withRequestContext } from '@/core/utils/api-wrapper';

export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    try {
      // Handler code
    } catch (error) {
      logger.error('Handler failed', {
        context: 'api-handler',
        error,
      });
    }
  });
}
```

### Adding Performance Tracking

#### Before

```typescript
export async function slowOperation() {
  const start = Date.now();
  await doWork();
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`Slow operation: ${duration}ms`);
  }
}
```

#### After

```typescript
import { createPerformanceLogger } from '@/core/utils/logger.server';

export async function slowOperation() {
  const perf = createPerformanceLogger('slow-operation', 1000);
  await doWork();
  perf.end({ operation: 'doWork' });
}
```

---

## Related Documentation

- [Monitoring Guide](./MONITORING.md) - Error tracking and performance monitoring
- [API Documentation](./API.md) - API endpoints and usage
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions

---

## Examples

### Complete API Route Example

```typescript
import { type NextRequest } from 'next/server';
import { withRequestContext } from '@/core/utils/api-wrapper';
import { logger, createPerformanceLogger } from '@/core/utils/logger.server';
import { createErrorResponse, createSuccessResponse } from '@/core/utils/api-responses';

export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    const perf = createPerformanceLogger('api.process', 2000);

    try {
      logger.info('Request received', {
        context: 'api.process',
        metadata: { method: 'POST' },
      });

      const body = await request.json();
      
      // Process request
      const result = await processRequest(body);

      perf.end({ success: true });
      return createSuccessResponse(result);
    } catch (error) {
      perf.end({ success: false });
      logger.error('Request processing failed', {
        context: 'api.process',
        error,
        metadata: { method: 'POST' },
      });
      return createErrorResponse('Processing failed', { status: 500 });
    }
  });
}
```

### Service Example

```typescript
import { logger, createPerformanceLogger } from '@/core/utils/logger.server';

export async function generatePortrait(photoUrl: string, styleId: string) {
  const perf = createPerformanceLogger('ai.generate', 3000);

  logger.info('Starting portrait generation', {
    context: 'ai.generate',
    metadata: { styleId },
  });

  try {
    const validation = await validateImage(photoUrl);
    if (!validation.valid) {
      logger.warn('Image validation failed', {
        context: 'ai.generate',
        metadata: { styleId, reason: validation.reason },
      });
      throw new Error('Invalid image');
    }

    const result = await callAIService(photoUrl, styleId);
    
    perf.end({ styleId, success: true });
    logger.info('Portrait generation completed', {
      context: 'ai.generate',
      metadata: { styleId, resultId: result.id },
    });

    return result;
  } catch (error) {
    perf.end({ styleId, success: false });
    logger.error('Portrait generation failed', {
      context: 'ai.generate',
      error,
      metadata: { styleId },
    });
    throw error;
  }
}
```

---

_Last updated: 2026-03-02_
