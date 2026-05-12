# Regrade — Hybrid LLM Pipeline on Cloudflare (Gemini extraction + Claude verification)

This plan implements the hybrid architecture you described, optimized for correctness, cost control, and mobile readiness.

## Target flow (as designed)

Upload arrives at Cloudflare Worker  
↓  
Worker stores file in R2, queues analysis job  
↓  
Analysis worker calls **Gemini** with the file  
→ returns structured JSON extraction (platform, rubric, scores, comments, handwriting, confidence)  
↓  
Worker calls **Claude** with Gemini extraction **plus the original file as a sanity check**  
→ returns verdict, appeal strength, missing info list, and an appeal email draft  
↓  
Worker writes to **D1** and notifies the mobile client  
↓  
Mobile renders breakdown  
↓  
Student reviews/edits/approves  
↓  
Claude regenerates email with tweaks  
↓  
Student sends from their own email client

---

## 1) Cloudflare components (recommended)

- **Pages**: hosts the Vite SPA (and the Capacitor web bundle if desired).
- **Workers** (API):
  - `upload-worker`: accepts uploads + creates jobs
  - `analysis-worker`: consumes queue messages and runs the hybrid pipeline
- **R2**: durable object storage for PDF/images and derived artifacts.
- **Queues**: analysis job queue.
- **D1**: job metadata + results + per-user state.
- **(Optional) Durable Objects**: for per-user rate limits, dedupe, and realtime fanout.
- **(Optional) Web Push**: notify web clients; mobile can poll initially.

---

## 2) API endpoints (stable client contract)

### Upload + job creation
- `POST /v1/uploads`
  - Auth: Firebase ID token (or Cloudflare Access / JWT)
  - Input: `multipart/form-data` or JSON with base64 (multipart preferred at scale)
  - Output: `{ jobId, caseId }`

### Job status
- `GET /v1/jobs/:jobId`
  - Output: `{ status, stage, progress, error?, result? }`

### Regenerate email after edits
- `POST /v1/cases/:caseId/email`
  - Input: `{ userEdits, tonePrefs, priorEmails? }`
  - Output: `{ emailSubject, emailBody }`

---

## 3) Data model (D1)

### Tables (sketch)
- `users`
  - `id`, `created_at`, `plan`, `quota_state_json`
- `cases`
  - `id`, `user_id`, `created_at`, `updated_at`, `status`, `summary_json`, `latest_job_id`
- `jobs`
  - `id`, `case_id`, `user_id`, `status`, `stage`, `created_at`, `updated_at`, `input_r2_keys_json`, `error`
- `artifacts`
  - `id`, `case_id`, `kind`, `r2_key`, `created_at`, `meta_json`

### R2 object keys (convention)
- `raw/{userId}/{caseId}/{jobId}/upload.pdf`
- `raw/{userId}/{caseId}/{jobId}/img_01.jpg`
- `derived/{userId}/{caseId}/{jobId}/gemini_extraction.json`
- `derived/{userId}/{caseId}/{jobId}/claude_verdict.json`

---

## 4) Hybrid LLM design details

### Stage 1 — Gemini extraction (multimodal, strict JSON)
Goal: *Extract what’s on the page*, not argue the case.

Input to Gemini:
- System: `ANALYTICAL_SYSTEM_PROMPT` (versioned)
- User parts:
  - “Analyze these documents…” framing
  - Inline images/PDF renders (or the original images)

Output:
- Must validate against a strict schema.
- Store in R2 + D1 pointer.

### Stage 2 — Claude verification + reasoning
Goal: sanity-check extraction, classify issues, draft appeal language.

Inputs to Claude:
- Gemini extraction JSON
- The original file (or a subset of images) as a “verify” reference
- Optional: prior emails (if user provides)
- Optional: user preferences / tone

Outputs:
- Verdict object:
  - `appealStrength`
  - `missingInfo`
  - `recommendedAngle`
  - `draftEmail`
  - `citations` (explicit references to extraction fields + image/page regions when available)

Important: Claude should be instructed to:
- Treat Gemini extraction as a hypothesis.
- Reject or mark uncertain items if the file contradicts it.

---

## 5) Correctness strategy (needed at scale)

- **Schema validation** after each model.
- **One repair attempt** if JSON invalid (deterministic “repair JSON” prompt).
- **Confidence gating**:
  - If low confidence on totals or key fields, mark job as `needs_more_info` with a clear “retake photo” reason.
- **Citations**:
  - Store “where” each number came from (page + approximate region if available).
  - Even coarse citations improve trust and debugging.

---

## 6) Cost + abuse control

- **Dedupe** by content hash (same upload → same job result).
- **Quotas** per user (analyses/day, bytes/day).
- **Hard limits**:
  - max pages / max images
  - max total upload size
- **Compression**:
  - client-side downscale + server-side re-encode (WebP/JPEG) before LLM.

---

## 7) Notifications to clients

Phase 1:
- Client polls `GET /v1/jobs/:id` every 2–5 seconds with backoff.

Phase 2:
- Web push / SSE / Durable Object fanout.
- Mobile push via APNs/FCM once native shells are stable.

---

## 8) Migration plan from current Node/Express API

1. Keep current endpoints running (Gemini-only) as baseline.
2. Introduce Cloudflare upload/job API in parallel (behind a feature flag).
3. Move analysis traffic gradually:
   - start with 5% of users
   - compare outputs and error rates
4. Once stable, deprecate the old synchronous `/analyze` route.

---

## 9) Implementation order (recommended)

1. **Define schemas** for Gemini extraction + Claude verdict (Zod).
2. **R2 upload worker** + D1 job record + Queues message.
3. **Analysis worker**:
   - Gemini extraction → validate → persist
   - Claude verification → validate → persist
4. **Client job UI** (status/progress + retry).
5. **Quotas + dedupe**.
6. **Notifications**.

