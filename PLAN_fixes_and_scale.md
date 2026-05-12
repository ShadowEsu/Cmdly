# Regrade — Fixes & Scale Plan (ordered)

This plan is organized by track (UI/Auth/Data/Platform/Quality) and sequenced to minimize regressions while steadily improving reliability, performance, and maintainability toward **50k users**.

## 0) Guiding principles (apply to all tracks)

- **Keep the client API contract stable**: the browser/mobile talks to your API, not vendors directly.
- **Prefer deterministic behavior over “smart guesses”**: if uncertain, surface `null` + clear next steps.
- **User trust first**: visible privacy controls, explainable memory, clear error messages.
- **Cost-aware by design**: limit payload sizes, compress images, cache results, apply quotas.

---

## Track A — UI/UX improvements (high impact, low risk)

### A1. Upload UX on mobile (reduce churn)
- Add **image compression** before base64 (client-side) and show “estimated upload size”.
- Add “Add from camera / photos / files” affordances (Capacitor-friendly).
- Add progress states that map to backend stages (queued → extracting → verifying → ready).

### A2. Results UX (trust + clarity)
- Display “**What we saw**” (platform detected, totals, per-question scores) before the verdict.
- Show **confidence per item** (e.g., low confidence on Q4 score) with a “retake photo” CTA.
- Add “export” actions: copy appeal email, download evidence pack summary (not raw uploads by default).

### A3. Auth UX polish
- On Auth screen, explicitly show “Email verification required for password accounts”.
- Add “Resend verification” shortcut on Auth itself (link to Verify screen or inline).

---

## Track B — Auth & account correctness (must be rock-solid)

### B1. Firebase Auth configuration hardening (checklist)
- Ensure Authorized domains include your real dev and prod hostnames.
- Ensure email templates work for verification/reset; confirm deliverability (spam).
- Add an in-app “Auth diagnostics” panel (for admins only) showing:
  - current origin
  - firebaseReady
  - last auth error code

### B2. Session + verification flow resilience
- Keep `applyActionCode` handling for email links.
- Add “**open email link on this device**” guidance and a visible troubleshooting section for common error codes.

---

## Track C — Data model & persistence (Firestore now; migration-ready later)

### C1. Firestore schema review + index checklist
- Confirm indexes for:
  - `cases` where `userId == uid` orderBy `createdAt desc`
- Reduce document bloat:
  - Keep `cases` documents as **summary + pointers**.
  - Store large analysis payloads separately (Storage/R2 later, or a `caseAnalyses` subcollection).

### C2. “Memory” (progressive learning) — safe version
- Implement **user-controlled memory**:
  - `users/{uid}/preferences` (tone, platform, school)
  - `cases/{caseId}/memorySummary` (what they already tried, constraints)
- Add UI to **view/edit/delete** memory.
- Never let memory override the current uploaded evidence; always treat evidence as source of truth.

---

## Track D — API reliability + cost control (required for 50k users)

### D1. Strict validation on every LLM response
- Validate analysis JSON against a Zod schema server-side.
- If invalid:
  - retry once with a “repair JSON” prompt
  - then fail with a user-friendly message + keep raw response for debugging (server logs only)

### D2. Rate limits → quotas (cost-based)
- Add per-UID daily quotas:
  - max analyses/day
  - max images/day
  - max total bytes/day
- Add idempotency:
  - content hash → same input returns same job/result (cache hit)

### D3. Async jobs (avoid timeouts)
- Convert analysis to job-based flow:
  - `POST /analyze` returns `202 { jobId }`
  - client polls `/jobs/:id` or receives push notification

---

## Track E — Observability & operations (you can’t scale blind)

### E1. Instrumentation
- Add structured logs (requestId, uid, endpoint, latency, payload size, vendor, cache hit).
- Add error reporting (client + server) and alerting for spikes.

### E2. Feature flags / staged rollouts
- Gate new LLM changes behind flags:
  - vendor selection
  - prompt versions
  - memory features
- Roll out to a small percentage first.

---

## Track F — Codebase cleanliness (ongoing)

### F1. Reduce legacy surface area
- Identify and remove or clearly fence “Cmdly-era” unused web modules (pages/data/components) to:
  - reduce confusion
  - reduce bundle size
  - reduce security surface

### F2. Naming + layering
- Rename `src/lib/gemini.ts` → `src/lib/llmClient.ts` once hybrid is in.
- Keep vendor SDKs **server-only**.

---

## Suggested execution order (recommended)

1. **D1** (validation) + **E1** (instrumentation): prevents silent wrong outputs and enables debugging.
2. **D3** (async jobs): makes the system resilient at load.
3. **D2** (quotas + cache): caps cost and improves latency.
4. **A1/A2** (mobile/results UX): improves conversion and reduces support load.
5. **C2** (memory) + **F1** (cleanup): personalization without risk, and a clearer codebase.

