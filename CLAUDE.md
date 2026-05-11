# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev (port 3000)
npm run dev

# Backend dev (port 8787, tsx watch)
npm --prefix server run dev

# Type-check (frontend)
npm run lint

# Type-check (backend)
npm --prefix server run lint

# Production build
npm run build

# Deploy hosting + rules
npm run deploy:hosting
npm run deploy:rules
```

Both servers must run simultaneously during development. Vite proxies `/api/*` to `localhost:8787`.

## Architecture

**Three-layer stack:**

```
React SPA (Vite + Tailwind + Firebase Auth client)
    ↓ Firestore SDK (direct)      ↓ /api proxy
Express server (port 8787)
    ↓ Firebase Admin              ↓ Gemini 2.5 Flash
Firestore (project: regrade-75d1a, database: default)
```

**AI routing is server-only.** The Gemini API key never touches the client. All AI calls go through two Express routes in `server/src/regradeGemini.ts`:
- `POST /v1/gemini/analyze` — grades a submission; uses `analyticalSystemPrompt`; returns structured `AnalysisResult` JSON
- `POST /v1/gemini/advocate` — multi-turn appeal chat; uses `advocateSystemPrompt`; takes `history[]` array

Every server request is validated by Zod, Firebase-token-authenticated, and rate-limited (IP + UID).

**User journey in the UI:** Dashboard → Upload Center → Evidence Summary → Verdict Report → Advocate Chat → History. All in `src/views/`. The `src/pages/` and `src/data/commands.ts` files are legacy Cmdly artifacts and are not part of the active appeal workflow.

## Key Files

| Path | Role |
|---|---|
| `src/views/` | All active UI — the full appeal flow lives here |
| `src/services/caseService.ts` | Firestore CRUD for cases |
| `src/services/userService.ts` | User profile sync |
| `src/lib/firebase.ts` | Firebase init and auth error normalization |
| `server/src/regradeGemini.ts` | Gemini proxy routes + Zod schemas |
| `server/src/shared/` | `analyticalSystemPrompt.js` and `advocateSystemPrompt.js` — edit these to change AI behavior |
| `firestore.rules` | Row-level security (strict field whitelists, ownership checks, timestamp validation) |

## Data Models

**Case (Firestore `cases/{caseId}`):**
```typescript
{
  userId: string;          // owner — all rules filter on this
  title, description, ref: string;
  status: 'Under Review' | 'Resolved' | 'Draft Ready';
  progress: number;
  evidenceLogged: boolean;
  facultyReview: boolean;
  createdAt, updatedAt: Timestamp;
  analysis?: AnalysisResult;   // Gemini output, stored after analysis
  rawInput?: { assignment, rubric, feedback };
}
```

**AnalysisResult** (returned by `/v1/gemini/analyze` and stored in `case.analysis`): defined in `src/types.ts`; contains `questions[]`, `teacher_profile`, `case_analysis` with scoring alignment and unexplained deductions.

Subcollection `cases/{caseId}/milestones/{milestoneId}` tracks appeal progress steps.

## Firestore Security Rules

Rules enforce strict ownership — `userId` on a case must equal `request.auth.uid`. Writes validate exact field whitelists and require `updatedAt == request.time`. The `users/{uid}` document is owner-read/update only; email is immutable after creation. Any schema change to Firestore documents requires a matching rules update.

## Environment Variables

- **Frontend** (`.env`): `VITE_FIREBASE_*` vars. Copy from `.env.example`.
- **Backend** (`server/.env`): `GEMINI_API_KEY`, `CORS_ORIGIN`, `API_KEYS`, port. Copy from `server/.env.example`.

Neither env file is committed. See `FIREBASE_SETUP.md` for Firebase project setup and authorized domain configuration.

## Tailwind Theme

Primary `#00236f`, secondary `#006c49`, defined in `tailwind.config.js`. The app targets mobile-first (Capacitor iOS/Android planned).
