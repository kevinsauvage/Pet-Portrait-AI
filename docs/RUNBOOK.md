# Runbook

Operational procedures for common production issues and maintenance tasks.

---

## Table of Contents

- [Emergency Procedures](#emergency-procedures)
- [Common Issues](#common-issues)
- [Maintenance Tasks](#maintenance-tasks)
- [Health Checks](#health-checks)
- [Escalation](#escalation)

---

## Emergency Procedures

### Site Down

**Symptoms:**
- Site returns 500 error
- Site is completely inaccessible
- All requests failing

**Immediate Actions:**

1. **Check deployment status:**
   - Review deployment platform dashboard
   - Check for recent deployments
   - Review deployment logs

2. **Check Sentry for errors:**
   - Review recent errors
   - Check error frequency
   - Identify root cause

3. **Verify environment variables:**
   - Check if variables are still set
   - Verify no variables were accidentally removed

4. **Check external services:**
   - Shopify API status
   - OpenAI API status
   - UploadThing status
   - Redis status

5. **Rollback if needed:**
   - See [docs/ROLLBACK.md](./ROLLBACK.md)
   - Rollback to last known good deployment

**Time to Resolution:** < 15 minutes

---

### High Error Rate

**Symptoms:**
- Sentry showing spike in errors
- Error rate > 50 errors/minute
- Users reporting issues

**Immediate Actions:**

1. **Identify error pattern:**
   - Review Sentry error grouping
   - Check most common error types
   - Identify affected endpoints

2. **Check recent changes:**
   - Review recent deployments
   - Check for configuration changes
   - Review code changes

3. **Verify external services:**
   - Check Shopify API status
   - Verify OpenAI API is working
   - Check Redis connectivity

4. **Temporary mitigation:**
   - If specific endpoint failing, consider disabling it
   - Increase rate limits if needed
   - Add circuit breakers if applicable

5. **Fix and deploy:**
   - Fix root cause
   - Deploy fix
   - Monitor error rate

**Time to Resolution:** < 30 minutes

---

### Performance Degradation

**Symptoms:**
- Page load times > 5 seconds
- API response times > 3 seconds
- High server CPU/memory usage

**Immediate Actions:**

1. **Check Sentry Performance:**
   - Review slow transactions
   - Identify bottlenecks
   - Check P95/P99 response times

2. **Check resource usage:**
   - Review server metrics
   - Check memory usage
   - Verify CPU usage

3. **Review recent changes:**
   - Check for recent deployments
   - Review code changes
   - Check for new dependencies

4. **Check external services:**
   - Verify Shopify API response times
   - Check OpenAI API latency
   - Review Redis performance

5. **Optimize:**
   - Add caching where appropriate
   - Optimize database queries
   - Reduce bundle size if needed

**Time to Resolution:** < 1 hour

---

## Common Issues

### AI Generation Failing

**Symptoms:**
- `/api/ai/generate` returns errors
- Users unable to generate portraits

**Diagnosis:**

1. **Check OpenAI API:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Check rate limits:**
   - Review rate limit logs
   - Check if limits are being hit

3. **Review Sentry errors:**
   - Check for OpenAI API errors
   - Review error messages

**Resolution:**

1. **If API key invalid:**
   - Verify `OPENAI_API_KEY` is correct
   - Check API key hasn't expired
   - Verify account has credits

2. **If rate limited:**
   - Wait for rate limit window
   - Consider upgrading OpenAI plan
   - Implement request queuing

3. **If image validation fails:**
   - Verify image URLs are accessible
   - Check image format and size
   - Review validation logic

---

### Cart Not Working

**Symptoms:**
- Users unable to add items to cart
- Cart operations fail
- Checkout redirects fail

**Diagnosis:**

1. **Check Shopify API:**
   ```bash
   curl https://your-store.myshopify.com/api/2025-01/graphql.json \
     -H "X-Shopify-Storefront-Access-Token: $SHOPIFY_STORE_FRONT_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query": "{ shop { name } }"}'
   ```

2. **Review Sentry errors:**
   - Check for Shopify API errors
   - Review GraphQL errors

3. **Check cart cookies:**
   - Verify cookies are being set
   - Check cookie security settings

**Resolution:**

1. **If Shopify API failing:**
   - Verify `SHOPIFY_STORE_FRONT_ACCESS_TOKEN` is valid
   - Check Shopify API status
   - Review GraphQL queries

2. **If cookies not working:**
   - Check cookie configuration
   - Verify same-site settings
   - Review CORS configuration

---

### Rate Limiting Issues

**Symptoms:**
- Legitimate users getting rate limited
- Rate limits not working
- Too many 429 errors

**Diagnosis:**

1. **Check Redis:**
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

2. **Review rate limit configuration:**
   - Check `RATE_LIMIT_WINDOW_MS`
   - Verify `RATE_LIMIT_MAX_REQUESTS`

3. **Check rate limit logs:**
   - Review Redis keys
   - Check IP identification

**Resolution:**

1. **If Redis down:**
   - Verify Redis instance is running
   - Check Redis connection
   - System falls back to in-memory (single instance)

2. **If limits too strict:**
   - Adjust `RATE_LIMIT_MAX_REQUESTS`
   - Increase `RATE_LIMIT_WINDOW_MS`
   - Consider per-user limits

3. **If limits not working:**
   - Verify Redis is configured
   - Check rate limit implementation
   - Review IP identification logic

---

## Maintenance Tasks

### Daily Checks

- [ ] Review Sentry for new errors
- [ ] Check error rate trends
- [ ] Review performance metrics
- [ ] Check external service status

### Weekly Tasks

- [ ] Review error trends
- [ ] Check performance metrics
- [ ] Review rate limit usage
- [ ] Check for security updates
- [ ] Review deployment logs

### Monthly Tasks

- [ ] Review and optimize performance
- [ ] Check for dependency updates
- [ ] Review and update documentation
- [ ] Review monitoring and alerting
- [ ] Check backup procedures

---

## Health Checks

### Application Health

**Check endpoints:**

```bash
# Homepage
curl https://yourdomain.com

# API health (if implemented)
curl https://yourdomain.com/api/health

# Cart endpoint
curl https://yourdomain.com/api/cart
```

**Expected responses:**
- Homepage: 200 OK
- API health: 200 OK with health status
- Cart: 200 OK or 404 (if no cart)

### External Services

**Shopify:**
```bash
curl https://your-store.myshopify.com/api/2025-01/graphql.json \
  -H "X-Shopify-Storefront-Access-Token: $SHOPIFY_STORE_FRONT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ shop { name } }"}'
```

**OpenAI:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Redis:**
```bash
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

### Monitoring Health

**Sentry:**
- Check Sentry dashboard for recent errors
- Verify error tracking is working
- Check performance monitoring

**Rate Limiting:**
- Review rate limit metrics
- Check Redis connectivity
- Verify rate limits are being enforced

---

## Escalation

### When to Escalate

Escalate if:
- Site is down for > 15 minutes
- Error rate > 100 errors/minute
- Critical data loss
- Security incident
- Unable to resolve within SLA

### Escalation Path

1. **Level 1:** On-call engineer
2. **Level 2:** Senior engineer / Tech lead
3. **Level 3:** Engineering manager
4. **Level 4:** CTO / VP Engineering

### Information to Provide

When escalating, include:
- Issue description
- Impact (users affected, revenue impact)
- Steps taken so far
- Error logs / Sentry links
- Recent changes
- Current status

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Rollback Guide](./ROLLBACK.md) - Rollback procedures
- [Monitoring Guide](./MONITORING.md) - Monitoring setup
