import type { Command, PlatformId } from "../types";

const cats = ["Session", "Workflow", "Navigation", "Skill", "MCP", "Model", "Debug", "Integrations"] as const;

function claudeCmd(name: string, i: number, short: string, detail: string, weight = 1): Command {
  return {
    id: `claude-${name.replace(/^\//, "").replace(/\//g, "-")}`,
    platform: "claude",
    name,
    short,
    detail,
    category: cats[i % cats.length],
    weight,
  };
}

/** All Claude Code slash commands from product spec */
const CLAUDE_NAMES = [
  "/add-dir",
  "/agents",
  "/autofix-pr",
  "/batch",
  "/branch",
  "/btw",
  "/chrome",
  "/clear",
  "/compact",
  "/config",
  "/context",
  "/copy",
  "/cost",
  "/debug",
  "/desktop",
  "/diff",
  "/doctor",
  "/effort",
  "/export",
  "/fast",
  "/feedback",
  "/focus",
  "/help",
  "/hooks",
  "/ide",
  "/init",
  "/insights",
  "/login",
  "/logout",
  "/loop",
  "/mcp",
  "/memory",
  "/model",
  "/permissions",
  "/plan",
  "/plugin",
  "/powerup",
  "/recap",
  "/release-notes",
  "/remote-control",
  "/rename",
  "/resume",
  "/review",
  "/rewind",
  "/sandbox",
  "/schedule",
  "/security-review",
  "/simplify",
  "/skills",
  "/status",
  "/tasks",
  "/team-onboarding",
  "/teleport",
  "/terminal-setup",
  "/theme",
  "/tui",
  "/ultraplan",
  "/ultrareview",
  "/upgrade",
  "/usage",
  "/voice",
  "/web-setup",
] as const;

const claudeCommands: Command[] = CLAUDE_NAMES.map((name, i) => {
  const key = name.slice(1);
  const high = ["/init", "/plan", "/review", "/mcp", "/skills", "/compact", "/doctor"].includes(name);
  return claudeCmd(
    name,
    i,
    `Terminal action for ${key.replace(/-/g, " ")}.`,
    `${name} is part of Claude Code’s slash-command toolkit. Use it when you want the agent to focus on ${key.replace(
      /-/g,
      " ",
    )}: follow on-screen hints, pair with /plan or /review for larger changes, and prefer /doctor if behavior feels off. Docs change often—verify against Anthropic’s latest Claude Code reference.`,
    high ? 3 : 1,
  );
});

// More teachable, human-friendly descriptions for frequently used commands.
const CLAUDE_OVERRIDES: Partial<Record<(typeof CLAUDE_NAMES)[number], Pick<Command, "category" | "short" | "detail" | "weight">>> =
  {
    "/add-dir": {
      category: "Session",
      weight: 3,
      short: "Add a folder to Claude’s working context.",
      detail:
        "Use this when the agent is missing files because they’re outside the current workspace scope. After adding a directory, ask for a quick inventory (key folders, entrypoints, build scripts) and then give a concrete goal. Tip: add the smallest directory that contains what you need—don’t dump huge mono-repos unless necessary.",
    },
    "/agents": {
      category: "Workflow",
      weight: 2,
      short: "Manage or inspect agent workflows/sub-agents.",
      detail:
        "Use this when you want to run specialized helpers (reviewer, test runner, explorer) or see what agents are available. Great for parallelizing: one agent explores the codebase while another runs builds/tests. Follow it with the exact question each agent should answer.",
    },
    "/autofix-pr": {
      category: "Navigation",
      weight: 2,
      short: "Iterate on a PR: fix CI, resolve comments.",
      detail:
        "Use this when you already have a pull request and want the agent to make it merge-ready. Typical loop: read failing checks, apply targeted fixes, rerun tests/build, and push updates. Best paired with a clear constraint like “don’t change behavior, only fix lint/tests.”",
    },
    "/batch": {
      category: "Skill",
      weight: 2,
      short: "Run a batch action across many items.",
      detail:
        "Use this for repetitive edits or multi-file operations with a consistent rule (renames, formatting, updating imports, applying the same refactor pattern). Describe the transformation precisely, include a few examples, and ask for a final diff summary + build/test run.",
    },
    "/branch": {
      category: "MCP",
      weight: 2,
      short: "Create/switch branches for isolated work.",
      detail:
        "Use this when you want changes in a clean branch (feature work, experiments, or a safe rollback path). Name the branch after intent (e.g. theme-word-physics). After branching, ask the agent to keep commits small and descriptive.",
    },
    "/btw": {
      category: "Model",
      weight: 1,
      short: "Quick aside / meta note in the workflow.",
      detail:
        "Use this when you need to insert a short clarification (constraints, preference, or correction) without redoing the whole prompt. Example: “/btw don’t touch Android, web only” or “/btw prioritize readability over animation.”",
    },
    "/chrome": {
      category: "Debug",
      weight: 2,
      short: "Browser debugging workflow (Chrome).",
      detail:
        "Use this when the issue is visual or runtime-only (CSS, layout, console errors, network requests). Typical flow: reproduce steps, check console, inspect DOM/CSS, confirm computed styles, then patch. Provide the exact symptom and where you see it.",
    },
    "/clear": {
      category: "Integrations",
      weight: 1,
      short: "Clear session state / resets for a clean run.",
      detail:
        "Use when context has gotten noisy (stale assumptions, too many files, or the agent is stuck). After clearing, restate your goal, current repo state, and the exact files/routes involved so the agent can re-anchor quickly.",
    },
    "/compact": {
      category: "Session",
      weight: 3,
      short: "Compress context while keeping key facts.",
      detail:
        "Use when the thread is long and you want the agent to keep only the important decisions, constraints, and current state. Great before starting a new feature on the same repo. After compacting, ask for the next 2–3 concrete steps.",
    },
    "/config": {
      category: "Workflow",
      weight: 2,
      short: "Inspect or adjust project configuration.",
      detail:
        "Use when builds/tools behave unexpectedly (Vite/Tailwind/TypeScript, linting, formatting, env vars). Ask for what the current config does, what knobs matter, and a safe minimal change. Always request a build after config edits.",
    },
    "/context": {
      category: "Navigation",
      weight: 2,
      short: "Show what the agent currently knows/uses.",
      detail:
        "Use to verify what files and assumptions are in play. Helpful when results feel off: you can confirm whether the agent actually read a file, is using stale content, or missed a directory. Follow with “include X file” if needed.",
    },
    "/copy": {
      category: "Skill",
      weight: 1,
      short: "Copy content or patches cleanly.",
      detail:
        "Use when you want output formatted for direct pasting (snippets, diffs, prompts). Ask for exactly what you want copied: a single function, a full file, or a minimal patch. Combine with “no extra explanation” when you’re pasting into tools.",
    },
    "/cost": {
      category: "MCP",
      weight: 1,
      short: "Estimate or inspect token/usage cost.",
      detail:
        "Use when you’re optimizing spend or latency. Ask for where tokens are being used (large context, verbose outputs) and concrete strategies: trim files, reduce logs, summarize, or switch to a faster model for simpler tasks.",
    },
    "/debug": {
      category: "Model",
      weight: 2,
      short: "Enter a strict debugging loop.",
      detail:
        "Use when something is broken and you need evidence-driven fixes. Provide exact error messages, reproduction steps, expected vs actual behavior, and what you already tried. Ask for a hypothesis → check → patch → verify cycle.",
    },
    "/desktop": {
      category: "Debug",
      weight: 2,
      short: "Desktop app / IDE specific debugging.",
      detail:
        "Use when the bug depends on the desktop environment (Cursor/VS Code/OS, file watchers, permissions, keybindings). Include OS, app version, and logs. Ask for minimal changes first before deep refactors.",
    },
    "/diff": {
      category: "Integrations",
      weight: 2,
      short: "Review changes as a diff.",
      detail:
        "Use when you want to sanity-check exactly what changed. Ask for a short summary of intent + the key hunks, then a quick risk checklist (breaking changes, performance, accessibility). Best practice: run build/tests after reading the diff.",
    },
    "/doctor": {
      category: "Session",
      weight: 3,
      short: "Diagnose environment/tooling problems.",
      detail:
        "Use when commands fail unexpectedly (install issues, build tools, permissions, missing binaries). Provide the full error output. Ask for the most likely root causes + the fastest safe fix, then re-run the failing command to confirm.",
    },
    "/effort": {
      category: "Workflow",
      weight: 1,
      short: "Set how deep the agent should go.",
      detail:
        "Use this to control thoroughness. Low effort = quick pass; high effort = deeper audit and repeated verification. For UI changes, ask for higher effort if you care about edge cases (small screens, safe areas, dark-only contrast).",
    },
    "/export": {
      category: "Navigation",
      weight: 1,
      short: "Export or package output from the session.",
      detail:
        "Use when you need an artifact: a patch, a summary, a release note, or a clean chunk of code to move elsewhere. Specify the format (markdown, plain text, JSON) and what must be included/excluded.",
    },
    "/fast": {
      category: "Skill",
      weight: 1,
      short: "Fast iteration mode: minimal output, quick loops.",
      detail:
        "Use when you want rapid progress with fewer explanations. Tell the agent what to optimize for (speed vs safety) and ask it to keep changes small and build often. Great for UI tweaks and copy edits.",
    },
  };

for (const cmd of claudeCommands) {
  const o = CLAUDE_OVERRIDES[cmd.name as (typeof CLAUDE_NAMES)[number]];
  if (!o) continue;
  Object.assign(cmd, o);
}

function o(id: string, platform: PlatformId, name: string, category: string, short: string, detail: string, weight = 1): Command {
  return { id, platform, name, category, short, detail, weight };
}

const other: Command[] = [
  o("cg-1", "chatgpt", "/write", "Composer", "Draft long-form text in one shot.", "Starts a writing-focused pass—great for emails, outlines, and posts.", 2),
  o("cg-2", "chatgpt", "/image", "Media", "Generate or edit images from a prompt.", "Routes to image tooling when available in your workspace tier.", 2),
  o("cg-3", "chatgpt", "Custom Instructions", "Settings", "Persistent style and rules for every chat.", "Define tone, format, and safety preferences that apply globally.", 3),
  o("cg-4", "chatgpt", "@mention", "Context", "Pull a file or doc into context.", "Attach knowledge without pasting entire bodies—keeps threads cleaner.", 2),
  o("cg-5", "chatgpt", "DALL·E", "Media", "Image generation from natural language.", "Describe scene, style, and constraints; iterate with variations.", 1),
  o("cg-6", "chatgpt", "Code Interpreter", "Analysis", "Run Python in a sandbox for data tasks.", "Upload CSVs, charts, and notebooks-style workflows.", 2),
  o("cg-7", "chatgpt", "Browse", "Research", "Let the model read linked pages carefully.", "Use for fresh facts—still verify critical claims.", 1),
  o("cg-8", "chatgpt", "Temperature (API)", "API", "Controls randomness of completions.", "Lower = steadier; higher = more creative sampling.", 2),
  o("cg-9", "chatgpt", "System message", "API", "Steer model behavior at the start.", "Sets role, constraints, and output shape for developers.", 3),
  o("cg-10", "chatgpt", "JSON mode", "API", "Constrain outputs to valid JSON.", "Ideal for structured extraction and tool pipelines.", 2),
  o("cg-11", "chatgpt", "Streaming", "API", "Token-by-token responses.", "Improves perceived latency in assistants and UIs.", 1),
  o("cg-12", "chatgpt", "Function calling", "API", "Model proposes tool calls you execute.", "Connects LLM reasoning to your backend actions.", 3),
  o("cg-13", "chatgpt", "Vision (multimodal)", "API", "Send images with text prompts.", "Use for UI screenshots, diagrams, and OCR-style tasks.", 2),
  o("cg-14", "chatgpt", "Assistants API", "API", "Stateful threads with tools and files.", "Builds persistent agents with retrieval patterns.", 1),
  o("cg-15", "chatgpt", "Keyboard: Shift+Enter", "Navigation", "New line without sending.", "Standard chat hygiene for multi-line prompts.", 1),

  o("cr-1", "cursor", "⌘K / Ctrl+K", "Command", "Inline edit with AI at cursor.", "Select code, describe change, apply diff in place.", 3),
  o("cr-2", "cursor", "⌘L / Ctrl+L", "Chat", "Open AI chat sidebar.", "Ask questions about repo context and files.", 3),
  o("cr-3", "cursor", "⌘I / Ctrl+I", "Agent", "Agent mode for multi-file edits.", "Use for refactors and feature work with review steps.", 3),
  o("cr-4", "cursor", ".cursorrules", "Config", "Project-specific AI instructions.", "Codify architecture, style, and test expectations.", 2),
  o("cr-5", "cursor", "@Files", "Context", "Attach files to prompt.", "Ground answers in exact source snippets.", 2),
  o("cr-6", "cursor", "@Codebase", "Context", "Broad semantic search across repo.", "Good for “where is X implemented?”.", 2),
  o("cr-7", "cursor", "@Web", "Context", "Fetch fresh web context.", "Use sparingly; verify sources.", 1),
  o("cr-8", "cursor", "Composer", "Workflow", "Multi-file editing session.", "Plan then apply batched edits with previews.", 2),
  o("cr-9", "cursor", "Terminal ⌘⇧E", "Navigation", "Focus integrated terminal.", "Speed loop between code and commands.", 1),
  o("cr-10", "cursor", "Tab autocomplete", "Editing", "Ghost text completions.", "Accept with Tab when suggestion matches intent.", 2),
  o("cr-11", "cursor", "Diff review", "Workflow", "Accept/reject AI edits hunks.", "Keeps human control on risky changes.", 2),
  o("cr-12", "cursor", "Model picker", "Model", "Switch provider/model per task.", "Balance cost, speed, and reasoning depth.", 1),
  o("cr-13", "cursor", "MCP servers", "Integrations", "Connect tools to the agent.", "Expose databases, browsers, and internal APIs safely.", 2),
  o("cr-14", "cursor", "Privacy mode", "Settings", "Restrict cloud retention policies.", "Pick the mode that matches org compliance.", 1),
  o("cr-15", "cursor", "Ignore globs", "Config", "Exclude paths from indexing.", "Speed + reduce noise for huge repos.", 1),

  o("gm-1", "gemini", "generateContent", "API", "Primary one-shot completion call.", "Text in, structured parts out—foundation of most apps.", 3),
  o("gm-2", "gemini", "StreamGenerateContent", "API", "Lower latency token streaming.", "Better UX for chat-style surfaces.", 2),
  o("gm-3", "gemini", "Safety settings", "API", "Tune harm block thresholds.", "Balance safety vs utility per use case.", 1),
  o("gm-4", "gemini", "Multimodal input", "API", "Mix text, image, audio parts.", "Great for visual QA and transcription flows.", 2),
  o("gm-5", "gemini", "Function calling", "API", "Declarative tools the model can invoke.", "Same pattern as other frontier APIs.", 2),
  o("gm-6", "gemini", "System instruction", "API", "High-priority behavioral preamble.", "Use for role, format, and guardrails.", 2),
  o("gm-7", "gemini", "JSON schema / response mime", "API", "Constrain structured outputs.", "Reliable parsing for agents and ETL.", 2),
  o("gm-8", "gemini", "Embeddings", "API", "Vectorize text for search.", "RAG pipelines and clustering.", 1),
  o("gm-9", "gemini", "Google Search grounding", "Tools", "Optional live search augmentation.", "Improves recency when enabled.", 1),
  o("gm-10", "gemini", "Code execution tool", "Tools", "Let model propose runnable code.", "Use in controlled sandboxes only.", 1),
  o("gm-11", "gemini", "Thinking models", "Model", "Higher reasoning budget paths.", "Trade latency/cost for harder tasks.", 2),
  o("gm-12", "gemini", "Batch API", "API", "Async large jobs at discount.", "Offline enrichment and backfills.", 1),

  o("lv-1", "lovable", "Iterate in chat", "Workflow", "Describe UI changes in plain language.", "Fastest path from idea to deployed preview.", 3),
  o("lv-2", "lovable", "Connect GitHub", "Integrations", "Push generated repos to your org.", "Keeps ownership and review in familiar tools.", 2),
  o("lv-3", "lovable", "Supabase template", "Backend", "Auth + DB patterns out of the box.", "Accelerates full-stack MVPs.", 2),
  o("lv-4", "lovable", "Design system", "UI", "Consistent components and tokens.", "Ask for spacing, type scale, and states explicitly.", 1),
  o("lv-5", "lovable", "Responsive layouts", "UI", "Mobile-first CSS patterns.", "Specify breakpoints and nav patterns early.", 1),
  o("lv-6", "lovable", "SEO metadata", "Shipping", "Titles, OG tags, sitemap hooks.", "Mention routes and content model up front.", 1),
  o("lv-7", "lovable", "Env secrets", "Security", "Never paste keys into chat.", "Use host-provided secret storage patterns.", 2),
  o("lv-8", "lovable", "Edge functions", "Backend", "Lightweight serverless endpoints.", "Good for webhooks and token exchange.", 1),
  o("lv-9", "lovable", "Payments", "Integrations", "Stripe-style flows via prompts.", "Always review PCI-sensitive handling.", 1),
  o("lv-10", "lovable", "Analytics", "Shipping", "Wire events after core UX works.", "Define naming conventions first.", 1),
  o("lv-11", "lovable", "A11y pass", "Quality", "Keyboard and contrast fixes.", "Ask for axe-level checks on components.", 2),
  o("lv-12", "lovable", "Performance", "Quality", "Lazy routes and image strategy.", "Set budgets (LCP, CLS) in the prompt.", 1),

  o("pp-1", "perplexity", "Follow-up queries", "Search", "Refine answers with conversational follow-ups.", "Keeps thread context similar to chat-style discovery.", 3),
  o("pp-2", "perplexity", "Citations toggle", "Sources", "Switch between synthesized answer and cited sources.", "Prefer sources when correctness matters.", 2),
  o("pp-3", "perplexity", "Focus modes", "Research", "Narrow retrieval (e.g. academic, writing).", "Improves signal when you know the domain.", 2),
  o("pp-4", "perplexity", "File upload", "Context", "Drop PDFs or docs for grounded Q&A.", "Great for manuals and dense references.", 2),
  o("pp-5", "perplexity", "Model selector", "Model", "Swap reasoning depth vs latency.", "Match model to question difficulty.", 1),
  o("pp-6", "perplexity", "Mobile voice", "Input", "Dictate multi-step research prompts.", "Faster iteration on mobile.", 1),
  o("pp-7", "perplexity", "Thread share", "Collab", "Share a concise link to a solved thread.", "Watch privacy of attached files.", 1),
  o("pp-8", "perplexity", "Rewrite tone", "Writing", "Make an answer tighter or friendlier.", "Pair with citations for factual edits.", 1),

  o("cp-1", "copilot", "Win + C", "Shortcut", "Open Copilot overlay on Windows (when enabled).", "Depends on OEM and OS build—verify shortcuts for your SKU.", 2),
  o("cp-2", "copilot", "Edge sidebar", "Browser", "Side panel assistant while browsing.", "Strong for summaries and drafts from open tabs.", 2),
  o("cp-3", "copilot", "365 Copilot", "Work", "In-app actions across Word / Excel / Outlook.", "Controlled by tenant admin licensing.", 2),
  o("cp-4", "copilot", "Prompt library", "Productivity", "Reuse approved starter prompts.", "Aligns wording with IT policies.", 1),
  o("cp-5", "copilot", "Image generation", "Media", "Create visuals from descriptive prompts.", "Review output for policy and likeness issues.", 1),
  o("cp-6", "copilot", "Code completion", "Coding", "Inline suggestions inside supported IDEs.", "Still run tests and reviews like any AI diff.", 2),
  o("cp-7", "copilot", "Voice input", "Input", "Speak long prompts hands-free.", "Use in low-noise environments for accuracy.", 1),
  o("cp-8", "copilot", "Enterprise grounding", "RAG", "Answer from sanctioned org docs.", "Improves trust on internal workflows.", 2),

  o("ms-1", "mistral", "La Plateforme", "API", "Hosted endpoints for Mistral models.", "Good European alternative for SaaS backends.", 2),
  o("ms-2", "mistral", "Le Chat", "Product", "Consumer chat atop Mistral models.", "Iterate quickly on creative and coding asks.", 2),
  o("ms-3", "mistral", "Mistral Small / Large", "Model", "Pick cost vs reasoning trade-offs.", "Profile latency on your own prompts.", 1),
  o("ms-4", "mistral", "JSON mode", "API", "Constrain outputs to structured JSON.", "Pair with schemas in application code.", 2),
  o("ms-5", "mistral", "Function calling", "API", "Model proposes tool payloads you execute.", "Same agent pattern as other providers.", 2),
  o("ms-6", "mistral", "On-device / Edge", "Deploy", "Run smaller checkpoints where allowed.", "Check licensing for redistribution.", 1),
  o("ms-7", "mistral", "Batch jobs", "API", "/async-friendly workloads over REST.", "Use for enrichment pipelines.", 1),
  o("ms-8", "mistral", "Safety tiers", "Policy", "Pick moderation strictness profile.", "Match regulated industries.", 1),

  o("ds-1", "deepseek", "DeepSeek Chat", "Product", "Web chat experience for frontier models.", "Verify model card for your workload.", 2),
  o("ds-2", "deepseek", "Reasoning mode", "Model", "Higher compute path for harder math/code.", "Watch token usage and timeouts.", 2),
  o("ds-3", "deepseek", "API completions", "API", "Classic prompt → completion calls.", "Cache stable system prompts.", 2),
  o("ds-4", "deepseek", "System prompt hygiene", "Quality", "Short, declarative steering blocks.", "Reduces hallucinated tool calls.", 1),
  o("ds-5", "deepseek", "Context window discipline", "Context", "Front-load anchors; trim stale turns.", "Improves focus on huge threads.", 1),
  o("ds-6", "deepseek", "Streaming deltas", "API", "Incremental tokens for UX.", "Handle partial JSON carefully.", 1),
  o("ds-7", "deepseek", "Key rotation", "Security", "Rotate API keys via secret manager.", "Never embed keys in client apps.", 2),
  o("ds-8", "deepseek", "Rate limits", "Ops", "Backoff with jitter on 429.", "Protect user-facing SLA.", 1),

  o("gk-1", "grok", "Real-time vibe", "Product", "Tuned for spicy, conversational answers.", "Fact-check externally when stakes are high.", 2),
  o("gk-2", "grok", "X / 𝕏 tie-in", "Context", "Optional live social context surfaces.", "Respect geo and login requirements.", 1),
  o("gk-3", "grok", "Image understanding", "Vision", "Upload screenshots or memes for commentary.", "Don’t automate harassment or impersonation.", 1),
  o("gk-4", "grok", "Subscription tiers", "Billing", "Feature gates change with plan.", "Check current docs before shipping integrations.", 1),
  o("gk-5", "grok", "API (when available)", "API", "Programmatic completion endpoints.", "Read ToS before production traffic.", 1),
  o("gk-6", "grok", "Persona sliders", "UX", "Some builds expose playful vs factual modes.", "Defaults differ by surface.", 1),
  o("gk-7", "grok", "Thread export", "Collab", "Copy long outputs for archiving.", "Scrub secrets before sharing.", 1),
  o("gk-8", "grok", "Mobile app gestures", "Navigation", "OS-specific overlays and shortcuts.", "Update your shortcut list often.", 1),
];

export const ALL_COMMANDS: Command[] = [...claudeCommands, ...other];

export function commandsForPlatform(platform: PlatformId): Command[] {
  return ALL_COMMANDS.filter((c) => c.platform === platform);
}
