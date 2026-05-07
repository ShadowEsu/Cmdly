# Cmdly — Stitch AI Brief (Goal + Target + Design)

Paste this entire file into Stitch AI as the **product brief**. It is intentionally opinionated and specific so Stitch doesn’t “generic app” the design.

## 1) What we are building (one sentence)

**Cmdly is a dark-mode, mobile-first command vault for AI tools**—a fast reference that helps developers find the right command/workflow in seconds and save favorites.

## 2) The real goal (what “success” looks like)

Within ~10 seconds on a phone, a user should be able to:

- **Search** for a command or concept (“plan”, “mcp”, “permissions”, “review”, “debug”)
- **Open** the right platform deck (Claude / Cursor / ChatGPT / etc.)
- **Understand** the command at a glance (short description + one tight detail block)
- **Save** it for later and find it again instantly

Cmdly should feel like a **premium cheat-sheet + pocket playbook**, not a social product, not a docs site, and not a chat app.

## 3) Who it’s for (target)

- **Primary**: developers who use multiple AI tools (Claude Code, Cursor, ChatGPT, Gemini, etc.) and want a fast reference.
- **Secondary**: learners who want to understand “what does this command do / when do I use it?”

## 4) Who it’s NOT for (avoid these defaults)

- Not a “prompt library” with long essays.
- Not a knowledge base/wiki.
- Not a settings-heavy utility.
- Not a chat UI (no message bubbles, no assistant persona).

## 5) Core screens (mobile)

### Home (Browse)

- Brand moment: **CMDLY** + “Hello, Coder!”
- Quick stats (Commands / Platforms / Featured)
- Platform rail (cards)
- Curated sections: featured/trending/recommended/quick picks
- Optional “constellation” / “neural” view: floating text labels connected to a hub (“Vault”)

### Search

- Single powerful search bar
- Chips/tags to filter quickly (platforms, categories)
- Results list with:
  - command name (mono)
  - 1-line summary (serif)
  - save toggle

### Platform deck

- Big platform title + tagline
- Filter by category
- Command cards (tap → focused detail)

### Saved

- Clean list, same card structure as search
- No “collections” complexity in v1; it’s just saved items

## 6) Design direction (the vibe)

**Dark, calm, premium, readable.**

Think: “developer luxury”—high contrast, soft glows, subtle gradients, crisp spacing, zero clutter.

### Must-haves

- **Locked dark mode**
- **Big mobile type** (easy thumb scrolling, no tiny UI)
- **Subtle depth**: blurred surfaces / soft elevation (not skeuomorphic)
- **Fast scanning**: clear typographic hierarchy, consistent card templates
- **Accents**: platform-specific accent colors used sparingly

### Avoid

- Bright neon everywhere
- Excessive gradients
- Busy backgrounds that reduce text clarity
- Tiny icons, tiny tap targets, dense tables

## 7) Typography — Crimson Pro Light (important)

Cmdly’s signature is **Crimson Pro** with a **light weight** for the reading surfaces.

### Font roles

- **Primary UI / reading text**: `Crimson Pro` **Light (300)** or **Regular (400)** when contrast needs it
- **Command names**: a mono font (JetBrains Mono / system mono) at **Medium/SemiBold** for strong legibility

### Where Crimson Pro Light should be used

- Large headers like “Hello, Coder!” (Light feels premium)
- Body/descriptions on cards (“short” and “detail”)
- Secondary text blocks and section subtitles

### Where NOT to use Light (use 400–600 instead)

- Tiny labels (chips, badges, nav labels)
- Dense lists where thin strokes reduce readability
- Any text over accent gradients

### Practical guidance (mobile)

- Prefer **larger sizes + more line-height** over heavier weights.
- When Light looks washed out, bump to **400** before increasing shadows/glows.
- Keep command names mono and slightly heavier so they “snap” visually:
  - e.g. command name = mono 600; description = Crimson Pro 300/400.

## 8) Content style (how text should read)

- Short descriptions: **one clean sentence**
- Detail: **2–4 lines max** (no walls of text)
- Tone: confident, developer-first, no marketing fluff

## 9) Improvements we want next (so Stitch designs for it)

These are product improvements we consider necessary for v1 polish:

- **Better search**:
  - synonyms (“permissions” ⇄ “sandbox”, “review” ⇄ “diff”)
  - fast platform filter chips
- **Focused command view**:
  - tap a command → “focus sheet” with the detail and actions (Save, Copy)
- **Copy-to-clipboard**:
  - one-tap copy of command name (especially slash commands)
- **Consistency across platforms**:
  - unify card layout and spacing everywhere
- **Saved UX**:
  - empty state that nudges saving
  - quick “remove” without friction

Not required for v1:

- accounts, cloud sync, analytics
- backend catalog updates

## 10) Implementation constraints Stitch should respect

- Mobile-first layout, safe-area aware bottom nav
- A single reusable **Command Card** component style across lists
- Dark theme only; ensure contrast passes basic accessibility
- Keep the UI simple enough to translate to both:
  - web (React + Tailwind) and
  - Android (Compose + Material 3)

