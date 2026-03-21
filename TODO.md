## Medium

### Cross-domain coupling

**What:** Some domains import others (e.g. AI → creations/user) despite “avoid cross-domain imports” in `ARCHITECTURE.md`.

**Why:** Refactors ripple across modules; boundaries erode and onboarding gets harder.

**How:** Document explicitly allowed import edges, or introduce a thin application/orchestration layer and shared DTOs.

### Wishlist JSON shape

**What:** Parsed wishlist data only guarantees `id` is a string (`wishlist.service.ts`).

**Why:** Corrupt metafields can produce inconsistent UI or unsafe assumptions on other fields.

**How:** Zod-parse the full `SavedPortrait` (or equivalent) shape; cap list length early.

### Fragile auth error detection

**What:** `get-user.ts` clears the token when the error message contains `Unauthorized` or `401`.

**Why:** Brittle if API messages change; other failure modes may be misclassified.

**How:** Prefer structured error codes from the Shopify client (or typed errors) instead of string matching.

### Printful logging inconsistency

**What:** `src/infra/printful/printful-api-client.ts` uses `console.error` in several paths.

**Why:** Harder to correlate with request context in centralized logging / APM.

**How:** Switch to `logger.error` with a stable `context` and tags consistent with the rest of the app.

### Unnecessary OpenAI beta header

**What:** `OpenAI-Beta: assistants=v2` is sent on the image edits request in `portrait-generation.service.ts`.

**Why:** Noise and possible future incompatibility if the images API ignores or changes behavior around beta flags.

**How:** Remove unless OpenAI documents it as required for that endpoint.

### Loose typing in API route tests

**What:** Some route tests cast `Response` / `json()` as `any` (e.g. AI, cart routes).

**Why:** Weaker contracts when APIs evolve; regressions slip through.

**How:** Shared typed test helpers or Zod-parse response bodies in tests.

---

## Low

### Shopify cart / checkout edge coverage

**What:** Cart flows depend on cookie cart id and Shopify `userErrors` mapping; complex inventory/discount cases are easy to miss.

**Why:** Subtle production bugs under races or inventory/discount changes.

**How:** Expand Playwright coverage: stale cart, out-of-stock variant, rejected discount.

### JSON-LD script injection hygiene

**What:** JSON-LD uses `dangerouslySetInnerHTML` + `JSON.stringify` on product/layout pages.

**Why:** Usually safe with trusted objects; edge cases if untyped strings slip into schema payloads.

**How:** Build schemas from typed objects only; consider unicode-safe serialization if legacy browsers matter.

---
