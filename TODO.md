## 🟡 MEDIUM PRIORITY (Important for Production)

### 14. Analytics & Tracking Setup

**What:** Configure production analytics
**Why:** Understand user behavior and business metrics
**How:**

- Set up Google Tag Manager properly (`NEXT_PUBLIC_GTM_ID`)
- Configure ecommerce tracking (Shopify checkout events)
- Set up conversion tracking
- Add custom events for AI generation, cart additions
- Configure privacy-compliant analytics (GDPR, CCPA)
- Review cookie consent implementation
- Add analytics for error rates, performance metrics
- Document analytics setup

**Files:** `src/ui/components/consent/GtmScript.tsx`, `src/ui/components/consent/CookieBanner.tsx`

---

### 20. Legal & Compliance

**What:** Ensure legal compliance
**Why:** Avoid legal issues
**How:**

- Review privacy policy and terms of service
- Ensure GDPR compliance (cookie consent, data handling)
- Add proper legal pages (privacy, terms, refunds)
- Review and update legal text
- Ensure proper data retention policies
- Review third-party service compliance (Shopify, OpenAI, etc.)

**Files:** Legal pages, `src/domains/legal/`
