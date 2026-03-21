## Medium

### Unnecessary OpenAI beta header

**What:** `OpenAI-Beta: assistants=v2` is sent on the image edits request in `portrait-generation.service.ts`.

**Why:** Noise and possible future incompatibility if the images API ignores or changes behavior around beta flags.

**How:** Remove unless OpenAI documents it as required for that endpoint.

---

## Low

### JSON-LD script injection hygiene

**What:** JSON-LD uses `dangerouslySetInnerHTML` + `JSON.stringify` on product/layout pages.

**Why:** Usually safe with trusted objects; edge cases if untyped strings slip into schema payloads.

**How:** Build schemas from typed objects only; consider unicode-safe serialization if legacy browsers matter.

---
