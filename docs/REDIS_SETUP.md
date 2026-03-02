# Redis Setup Guide

This project uses Redis for distributed rate limiting in production. The Redis instance is provided via Vercel integration.

## Setup Steps

### 1. Install Dependencies

```bash
yarn add redis
```

### 2. Configure Environment Variable

The Redis URL is automatically provided by Vercel when you link the Redis integration to your project.

**For local development:**

1. Pull environment variables from Vercel:

   ```bash
   vercel env pull .env.local
   ```

2. Or manually add to `.env.local`:
   ```env
   REDIS_URL=redis://default:example.cloud.redislabs.com:179998
   ```

**For production:**

The `REDIS_URL` environment variable is automatically set by Vercel when the Redis integration is connected to your project.

### 3. Verify Setup

The rate limiting system will automatically:

- Use Redis when `REDIS_URL` is set
- Fall back to in-memory storage if Redis is unavailable
- Handle connection errors gracefully

## Configuration

### Rate Limit Settings

You can customize rate limiting behavior with environment variables:

```env
# Time window in milliseconds (default: 60000 = 1 minute)
RATE_LIMIT_WINDOW_MS=60000

# Maximum requests per window (default: 5)
RATE_LIMIT_MAX_REQUESTS=5
```

## How It Works

1. **Redis Connection**: A singleton Redis client is created on first use
2. **Rate Limiting**: Uses Redis `INCR` and `PEXPIRE` commands for distributed rate limiting
3. **Fallback**: If Redis is unavailable, falls back to in-memory rate limiting
4. **Key Format**: Rate limit keys use format: `[prefix]:[identifier]`

## Testing

To test Redis connection locally:

```bash
# Start your dev server
yarn dev

# The rate limiting will automatically use Redis if REDIS_URL is set
# Check your Redis instance to see keys being created
```

## Troubleshooting

### Redis Connection Fails

- Check that `REDIS_URL` is set correctly
- Verify the Redis instance is accessible
- Check network connectivity
- Rate limiting will automatically fall back to in-memory storage

### Rate Limiting Not Working

- Verify `REDIS_URL` is set in environment variables
- Check Redis instance is running and accessible
- Review rate limit configuration (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)

## Migration from Upstash

This project previously used `@upstash/redis`. The migration to `node-redis` provides:

- ✅ Standard Redis URL support (works with any Redis provider)
- ✅ Better compatibility with Vercel Redis integration
- ✅ Same functionality with simpler configuration

The old `RATE_LIMIT_REDIS_URL` and `RATE_LIMIT_REDIS_TOKEN` variables have been replaced with a single `REDIS_URL` variable.
