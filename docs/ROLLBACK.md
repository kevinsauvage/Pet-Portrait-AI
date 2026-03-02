# Rollback Procedures

Step-by-step guide for rolling back deployments when issues occur.

---

## Table of Contents

- [When to Rollback](#when-to-rollback)
- [Rollback Methods](#rollback-methods)
- [Vercel Rollback](#vercel-rollback)
- [Manual Rollback](#manual-rollback)
- [Post-Rollback Verification](#post-rollback-verification)
- [Preventing Future Issues](#preventing-future-issues)

---

## When to Rollback

Rollback immediately if:

- ✅ Site is completely down (500 errors)
- ✅ Critical functionality broken (cart, checkout, AI generation)
- ✅ High error rate (> 50 errors/minute)
- ✅ Performance degradation (> 5s page load)
- ✅ Security vulnerability introduced
- ✅ Data loss or corruption

**Do NOT rollback for:**
- Minor UI issues
- Non-critical features
- Expected temporary issues
- Issues that can be fixed with a hotfix

---

## Rollback Methods

### Method 1: Platform Rollback (Recommended)

Use your deployment platform's rollback feature (fastest, safest).

### Method 2: Git Rollback

Revert to previous commit and redeploy.

### Method 3: Feature Flag Disable

Disable problematic feature via feature flags (if available).

---

## Vercel Rollback

### Automatic Rollback

Vercel automatically creates deployments for each push. Rollback to any previous deployment:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to "Deployments" tab

2. **Select Previous Deployment**
   - Find the last known good deployment
   - Check deployment status (should be "Ready")

3. **Rollback**
   - Click "..." menu on the deployment
   - Select "Promote to Production"
   - Confirm rollback

4. **Verify**
   - Check site is working
   - Verify functionality
   - Monitor error rates

### Vercel CLI Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or rollback to previous
vercel rollback --prev
```

### Time to Rollback: < 2 minutes

---

## Manual Rollback

If platform rollback is not available:

### Step 1: Identify Last Good Commit

```bash
# View recent commits
git log --oneline -10

# Identify last known good commit
# Example: abc123def456
```

### Step 2: Revert Changes

**Option A: Revert Specific Commit**

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push revert commit
git push origin main
```

**Option B: Reset to Previous Commit**

```bash
# WARNING: This rewrites history
# Only use if you're the only one working on the branch

# Reset to previous commit (keep changes)
git reset --soft HEAD~1

# Or reset completely (discard changes)
git reset --hard HEAD~1

# Force push (use with caution)
git push origin main --force
```

### Step 3: Redeploy

```bash
# If using Vercel, push triggers deployment
git push origin main

# Or trigger manual deployment
vercel --prod
```

### Time to Rollback: 5-10 minutes

---

## Post-Rollback Verification

After rollback, verify:

### 1. Site Accessibility

```bash
# Check homepage loads
curl https://yourdomain.com

# Should return 200 OK
```

### 2. Core Functionality

- [ ] Homepage loads correctly
- [ ] Products load from Shopify
- [ ] Cart functionality works
- [ ] AI generation works (if applicable)
- [ ] Checkout redirects work

### 3. Error Monitoring

- [ ] Check Sentry for new errors
- [ ] Verify error rate is normal
- [ ] Review performance metrics

### 4. External Services

- [ ] Shopify API is accessible
- [ ] OpenAI API is working
- [ ] UploadThing is accessible
- [ ] Redis is connected

### Verification Script

```bash
#!/bin/bash

DOMAIN="https://yourdomain.com"

echo "Checking site health..."

# Homepage
curl -s -o /dev/null -w "%{http_code}" $DOMAIN
echo " - Homepage"

# API endpoints
curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/cart
echo " - Cart API"

# Check Sentry (if API available)
# curl -s $DOMAIN/api/health
```

---

## Preventing Future Issues

### Pre-Deployment Checks

Before deploying:

- [ ] All tests pass (`yarn test`)
- [ ] Type checking passes (`yarn type-check`)
- [ ] Linting passes (`yarn lint`)
- [ ] Build succeeds (`yarn build`)
- [ ] Test in staging environment
- [ ] Review code changes
- [ ] Check for breaking changes

### Deployment Best Practices

1. **Use Feature Flags**
   - Deploy features behind flags
   - Enable gradually
   - Easy to disable if issues occur

2. **Staged Rollouts**
   - Deploy to small percentage of users first
   - Monitor metrics
   - Gradually increase

3. **Monitor Closely**
   - Watch error rates during deployment
   - Monitor performance metrics
   - Set up alerts

4. **Keep Deployments Small**
   - Smaller changes = easier rollback
   - Easier to identify issues
   - Faster deployment times

### Rollback Plan

Always have a rollback plan:

1. **Identify rollback trigger**
   - Error rate threshold
   - Performance threshold
   - User-reported issues

2. **Know rollback procedure**
   - Platform rollback steps
   - Manual rollback steps
   - Time to rollback

3. **Test rollback procedure**
   - Practice rollback in staging
   - Document steps
   - Keep rollback time < 5 minutes

---

## Rollback Checklist

When rolling back:

- [ ] Identify root cause (if possible)
- [ ] Choose rollback method
- [ ] Execute rollback
- [ ] Verify site is working
- [ ] Check error monitoring
- [ ] Notify team (if needed)
- [ ] Document rollback reason
- [ ] Plan fix for next deployment

---

## Common Rollback Scenarios

### Scenario 1: Breaking API Change

**Symptoms:**
- API endpoints returning errors
- Frontend unable to fetch data

**Rollback:**
1. Rollback to previous deployment
2. Verify API endpoints work
3. Fix breaking change
4. Redeploy with fix

### Scenario 2: Environment Variable Issue

**Symptoms:**
- Missing environment variables
- Configuration errors

**Rollback:**
1. Rollback to previous deployment
2. Verify environment variables
3. Fix configuration
4. Redeploy

### Scenario 3: Dependency Issue

**Symptoms:**
- Build failures
- Runtime errors from dependencies

**Rollback:**
1. Rollback to previous deployment
2. Review dependency changes
3. Fix dependency issues
4. Test thoroughly
5. Redeploy

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Runbook](./RUNBOOK.md) - Operational procedures
- [Monitoring Guide](./MONITORING.md) - Monitoring setup

---

## Quick Reference

### Vercel Rollback (Fastest)

1. Vercel Dashboard → Deployments
2. Find last good deployment
3. Click "..." → "Promote to Production"
4. Verify site works

**Time: < 2 minutes**

### Git Rollback

1. `git log` - Find last good commit
2. `git revert <commit>` - Revert changes
3. `git push` - Trigger deployment
4. Verify site works

**Time: 5-10 minutes**

### Emergency Contact

If rollback fails or issues persist:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Runbook](./RUNBOOK.md)
- Escalate if needed
