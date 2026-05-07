# Cmdly — Design Doc (for Stitch AI)

## Summary

Cmdly is a mobile-first “command vault” for AI tools: a curated, offline-first reference for commands, shortcuts, and workflows across platforms (Claude, ChatGPT, Cursor, Gemini, etc.). It ships as:

- **Web**: React + Vite + Tailwind SPA (marketing + usable app experience).
- **Android**: Kotlin + Jetpack Compose app intended for Play Store distribution.

The current product is **read-only + local save** (no accounts, no server sync).

## Goals

- **Fast lookup**: search, browse by platform, and jump to common commands quickly.
- **Mobile-first readability**: big type, clear hierarchy, thumb-friendly navigation.
- **Brand consistency**: **dark-mode locked** visual system on web; Android uses a matching dark Material 3 palette.
- **Offline-first**: command catalog is bundled into the app(s), no runtime network required.
- **Low cognitive load**: minimal settings; “Saved” is the primary personalization.

## Non-goals (current scope)

- Accounts, cloud sync, collaboration, or multi-device state.
- Remote catalog updates / live docs ingestion.
- Analytics or tracking.

## Target users

- Developers using multiple AI tools who want a quick “cheat sheet”.
- New users learning agent workflows (e.g., Claude Code slash commands).
- Power users wanting a lightweight “saved commands” list.

## Product surfaces

### Shared concepts (Web + Android)

- **Platforms**: each platform has a deck/landing page.
- **Commands**: items have `name`, a short blurb, a longer detail, and a category.
- **Saved**: toggle a command into a “Saved” collection; persists locally.

### Web UX

- **Bottom nav**: Browse / Search / Saved.
- **Home**: greeting (“Hello, Coder!”), platform rail, “neural” constellation view of commands, and curated sections (featured/trending/recommended/quick).
- **Search**: fuzzy-ish text filtering and quick action to open a command in its platform page.
- **Platform page**: a scrollable deck; can deep-focus a command (via navigation state).

### Android UX

- **Bottom nav**: Browse / Search / Saved; platform pages are push navigation.
- **Home**: stats + platform carousel + curated bundles.
- **Search & Platform**: show command cards; enable haptics (currently hardcoded enabled).
- **Saved**: local list driven by `SavedStore`.

## Information architecture

### Command model (conceptual)

- `id`: stable unique string (used for saving).
- `platform`: platform identifier (e.g., `claude`, `cursor`).
- `name`: command name (often `/slash` or UI feature name).
- `short`: one-line description.
- `detail`: longer explanation, often with usage context.
- `category`: coarse grouping.
- `weight` (optional): biases selection for “featured” bundles.

### Platform model (conceptual)

- `routeId`: URL/route segment identifier.
- `label`: display name.
- `tagline`: 1-line descriptor.
- `accent` / `accentSoft`: visual signature colors.

## Visual design system

### Brand

- **CMDLY** wordmark in UI.
- Friendly developer greeting (“Hello, Coder!”).

### Typography

- Web uses **Crimson Pro** for UI and **JetBrains Mono** for command names.
- Android uses **serif-forward** typography via Material 3 `Typography`.

### Color

- Dark theme only on web (adds `dark` class at boot and sets `color-scheme: dark`).
- Android uses a dark `ColorScheme` tuned for high contrast and accent color pops.

## Architecture

### Web (React)

- Entry: `index.html` + `src/main.tsx`
- Router: `react-router-dom` routes in `src/App.tsx`
- Data: `src/data/commands.ts` (bundled command catalog) and `src/data/platforms.ts`
- Saved state: `src/context/CollectionsContext.tsx` storing IDs in `localStorage`
- Key UI components: `BottomNav`, `PlatformRail`, `CommandConstellation`, and related page components.

### Android (Compose)

- Entry: `MainActivity.kt` → `VaultApp()`
- Navigation: `NavHost` with routes for home/search/saved/platform
- Data: `CommandRepository.kt` + `Platform` enum
- Saved state: `SavedStore.kt` (local persistence)
- Theme: `VaultTheme.kt` (Material 3)

## Data management strategy

### Current

- Catalog is **compiled into the app** (no runtime fetch).
- Saved state is **local only**:
  - Web: `localStorage` set of saved command IDs.
  - Android: local store keyed by command ID.

### Parity note

Web and Android catalogs are currently **separate** implementations; copy and descriptions may drift. Long-term: generate both from one source (e.g., JSON → TS + Kotlin).

## “Backend later” (optional roadmap)

If remote updates are desired without shipping a new app build, the lightest architecture:

- **Static catalog JSON** hosted on a CDN (versioned, immutable URLs).
- **Client fetch** with ETag / `If-None-Match` and a small cache.
- **Merge strategy**: shipped catalog is the fallback; remote can override/add.
- **Safety**: schema validation, graceful downgrade to bundled catalog.

Out of scope until explicitly required: accounts, multi-tenant admin UI, contributor workflows, analytics.

## Release & deployment

### Web

- Build: `npm run build` produces `dist/` (static hosting).

### Android

- Requires **JDK 17** and Android tooling.
- Bundle for Play: `./gradlew :app:bundleRelease`
- Release signing supports:
  - `android/keystore.properties` (gitignored) or
  - env vars (`CMDLY_RELEASE_*`)

## Open questions / next decisions

- Should Android and web share a single source of truth for commands?
- Do we keep `applicationId` as-is or migrate to a Cmdly-specific namespace before Play launch?
- Is “backend stuff” required for v1, or are offline updates acceptable initially?

