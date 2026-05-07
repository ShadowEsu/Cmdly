package com.aicommandvault.app.data

import kotlin.random.Random

object CommandRepository {

    private val categories = listOf(
        "Session",
        "Workflow",
        "Navigation",
        "Skill",
        "MCP",
        "Model",
        "Debug",
        "Integrations",
    )

    private val claudeSlashes = listOf(
        "/add-dir", "/agents", "/autofix-pr", "/batch", "/branch", "/btw", "/chrome", "/clear",
        "/compact", "/config", "/context", "/copy", "/cost", "/debug", "/desktop", "/diff",
        "/doctor", "/effort", "/export", "/fast", "/feedback", "/focus", "/help", "/hooks",
        "/ide", "/init", "/insights", "/login", "/logout", "/loop", "/mcp", "/memory",
        "/model", "/permissions", "/plan", "/plugin", "/powerup", "/recap", "/release-notes",
        "/remote-control", "/rename", "/resume", "/review", "/rewind", "/sandbox", "/schedule",
        "/security-review", "/simplify", "/skills", "/status", "/tasks", "/team-onboarding",
        "/teleport", "/terminal-setup", "/theme", "/tui", "/ultraplan", "/ultrareview",
        "/upgrade", "/usage", "/voice", "/web-setup",
    )

    private val highlight = setOf("/init", "/plan", "/review", "/mcp", "/skills", "/compact", "/doctor")

    private fun claudeCommands(): List<VaultCommand> = claudeSlashes.mapIndexed { i, name ->
        val key = name.removePrefix("/").replace('-', ' ')
        val high = name in highlight
        VaultCommand(
            id = "claude-" + name.removePrefix("/").replace('/', '-'),
            platform = Platform.CLAUDE,
            name = name,
            short = "Terminal action for $key.",
            detail = "$name is part of Claude Code’s slash-command toolkit. Use it when you want the agent to focus on $key. Pair with /plan or /review for larger changes; use /doctor if behavior feels off. Always verify against current Anthropic Claude Code documentation.",
            category = categories[i % categories.size],
            weight = if (high) 3 else 1,
        )
    }

    private fun otherCommands(): List<VaultCommand> = listOf(
        v("cg-1", Platform.CHATGPT, "/write", "Composer", "Draft long-form text in one shot.", "Starts a writing-focused pass—great for emails, outlines, and posts.", 2),
        v("cg-2", Platform.CHATGPT, "/image", "Media", "Generate or edit images from a prompt.", "Routes to image tooling when available in your workspace tier.", 2),
        v("cg-3", Platform.CHATGPT, "Custom Instructions", "Settings", "Persistent style and rules for every chat.", "Define tone, format, and safety preferences that apply globally.", 3),
        v("cg-4", Platform.CHATGPT, "@mention", "Context", "Pull a file or doc into context.", "Attach knowledge without pasting entire bodies—keeps threads cleaner.", 2),
        v("cg-5", Platform.CHATGPT, "DALL·E", "Media", "Image generation from natural language.", "Describe scene, style, and constraints; iterate with variations.", 1),
        v("cg-6", Platform.CHATGPT, "Code Interpreter", "Analysis", "Run Python in a sandbox for data tasks.", "Upload CSVs, charts, and notebooks-style workflows.", 2),
        v("cg-7", Platform.CHATGPT, "Browse", "Research", "Let the model read linked pages carefully.", "Use for fresh facts—still verify critical claims.", 1),
        v("cg-8", Platform.CHATGPT, "Temperature (API)", "API", "Controls randomness of completions.", "Lower = steadier; higher = more creative sampling.", 2),
        v("cg-9", Platform.CHATGPT, "System message", "API", "Steer model behavior at the start.", "Sets role, constraints, and output shape for developers.", 3),
        v("cg-10", Platform.CHATGPT, "JSON mode", "API", "Constrain outputs to valid JSON.", "Ideal for structured extraction and tool pipelines.", 2),
        v("cg-11", Platform.CHATGPT, "Streaming", "API", "Token-by-token responses.", "Improves perceived latency in assistants and UIs.", 1),
        v("cg-12", Platform.CHATGPT, "Function calling", "API", "Model proposes tool calls you execute.", "Connects LLM reasoning to your backend actions.", 3),
        v("cg-13", Platform.CHATGPT, "Vision (multimodal)", "API", "Send images with text prompts.", "Use for UI screenshots, diagrams, and OCR-style tasks.", 2),
        v("cg-14", Platform.CHATGPT, "Assistants API", "API", "Stateful threads with tools and files.", "Builds persistent agents with retrieval patterns.", 1),
        v("cg-15", Platform.CHATGPT, "Keyboard: Shift+Enter", "Navigation", "New line without sending.", "Standard chat hygiene for multi-line prompts.", 1),

        v("cr-1", Platform.CURSOR, "⌘K / Ctrl+K", "Command", "Inline edit with AI at cursor.", "Select code, describe change, apply diff in place.", 3),
        v("cr-2", Platform.CURSOR, "⌘L / Ctrl+L", "Chat", "Open AI chat sidebar.", "Ask questions about repo context and files.", 3),
        v("cr-3", Platform.CURSOR, "⌘I / Ctrl+I", "Agent", "Agent mode for multi-file edits.", "Use for refactors and feature work with review steps.", 3),
        v("cr-4", Platform.CURSOR, ".cursorrules", "Config", "Project-specific AI instructions.", "Codify architecture, style, and test expectations.", 2),
        v("cr-5", Platform.CURSOR, "@Files", "Context", "Attach files to prompt.", "Ground answers in exact source snippets.", 2),
        v("cr-6", Platform.CURSOR, "@Codebase", "Context", "Broad semantic search across repo.", "Good for “where is X implemented?”.", 2),
        v("cr-7", Platform.CURSOR, "@Web", "Context", "Fetch fresh web context.", "Use sparingly; verify sources.", 1),
        v("cr-8", Platform.CURSOR, "Composer", "Workflow", "Multi-file editing session.", "Plan then apply batched edits with previews.", 2),
        v("cr-9", Platform.CURSOR, "Terminal ⌘⇧E", "Navigation", "Focus integrated terminal.", "Speed loop between code and commands.", 1),
        v("cr-10", Platform.CURSOR, "Tab autocomplete", "Editing", "Ghost text completions.", "Accept with Tab when suggestion matches intent.", 2),
        v("cr-11", Platform.CURSOR, "Diff review", "Workflow", "Accept/reject AI edits hunks.", "Keeps human control on risky changes.", 2),
        v("cr-12", Platform.CURSOR, "Model picker", "Model", "Switch provider/model per task.", "Balance cost, speed, and reasoning depth.", 1),
        v("cr-13", Platform.CURSOR, "MCP servers", "Integrations", "Connect tools to the agent.", "Expose databases, browsers, and internal APIs safely.", 2),
        v("cr-14", Platform.CURSOR, "Privacy mode", "Settings", "Restrict cloud retention policies.", "Pick the mode that matches org compliance.", 1),
        v("cr-15", Platform.CURSOR, "Ignore globs", "Config", "Exclude paths from indexing.", "Speed + reduce noise for huge repos.", 1),

        v("gm-1", Platform.GEMINI, "generateContent", "API", "Primary one-shot completion call.", "Text in, structured parts out—foundation of most apps.", 3),
        v("gm-2", Platform.GEMINI, "StreamGenerateContent", "API", "Lower latency token streaming.", "Better UX for chat-style surfaces.", 2),
        v("gm-3", Platform.GEMINI, "Safety settings", "API", "Tune harm block thresholds.", "Balance safety vs utility per use case.", 1),
        v("gm-4", Platform.GEMINI, "Multimodal input", "API", "Mix text, image, audio parts.", "Great for visual QA and transcription flows.", 2),
        v("gm-5", Platform.GEMINI, "Function calling", "API", "Declarative tools the model can invoke.", "Same pattern as other frontier APIs.", 2),
        v("gm-6", Platform.GEMINI, "System instruction", "API", "High-priority behavioral preamble.", "Use for role, format, and guardrails.", 2),
        v("gm-7", Platform.GEMINI, "JSON schema / response mime", "API", "Constrain structured outputs.", "Reliable parsing for agents and ETL.", 2),
        v("gm-8", Platform.GEMINI, "Embeddings", "API", "Vectorize text for search.", "RAG pipelines and clustering.", 1),
        v("gm-9", Platform.GEMINI, "Google Search grounding", "Tools", "Optional live search augmentation.", "Improves recency when enabled.", 1),
        v("gm-10", Platform.GEMINI, "Code execution tool", "Tools", "Let model propose runnable code.", "Use in controlled sandboxes only.", 1),
        v("gm-11", Platform.GEMINI, "Thinking models", "Model", "Higher reasoning budget paths.", "Trade latency/cost for harder tasks.", 2),
        v("gm-12", Platform.GEMINI, "Batch API", "API", "Async large jobs at discount.", "Offline enrichment and backfills.", 1),

        v("lv-1", Platform.LOVABLE, "Iterate in chat", "Workflow", "Describe UI changes in plain language.", "Fastest path from idea to deployed preview.", 3),
        v("lv-2", Platform.LOVABLE, "Connect GitHub", "Integrations", "Push generated repos to your org.", "Keeps ownership and review in familiar tools.", 2),
        v("lv-3", Platform.LOVABLE, "Supabase template", "Backend", "Auth + DB patterns out of the box.", "Accelerates full-stack MVPs.", 2),
        v("lv-4", Platform.LOVABLE, "Design system", "UI", "Consistent components and tokens.", "Ask for spacing, type scale, and states explicitly.", 1),
        v("lv-5", Platform.LOVABLE, "Responsive layouts", "UI", "Mobile-first CSS patterns.", "Specify breakpoints and nav patterns early.", 1),
        v("lv-6", Platform.LOVABLE, "SEO metadata", "Shipping", "Titles, OG tags, sitemap hooks.", "Mention routes and content model up front.", 1),
        v("lv-7", Platform.LOVABLE, "Env secrets", "Security", "Never paste keys into chat.", "Use host-provided secret storage patterns.", 2),
        v("lv-8", Platform.LOVABLE, "Edge functions", "Backend", "Lightweight serverless endpoints.", "Good for webhooks and token exchange.", 1),
        v("lv-9", Platform.LOVABLE, "Payments", "Integrations", "Stripe-style flows via prompts.", "Always review PCI-sensitive handling.", 1),
        v("lv-10", Platform.LOVABLE, "Analytics", "Shipping", "Wire events after core UX works.", "Define naming conventions first.", 1),
        v("lv-11", Platform.LOVABLE, "A11y pass", "Quality", "Keyboard and contrast fixes.", "Ask for axe-level checks on components.", 2),
        v("lv-12", Platform.LOVABLE, "Performance", "Quality", "Lazy routes and image strategy.", "Set budgets (LCP, CLS) in the prompt.", 1),

        v("pp-1", Platform.PERPLEXITY, "Follow-up queries", "Search", "Refine answers with conversational follow-ups.", "Keeps thread context similar to chat-style discovery.", 3),
        v("pp-2", Platform.PERPLEXITY, "Citations toggle", "Sources", "Switch between synthesized answer and cited sources.", "Prefer sources when correctness matters.", 2),
        v("pp-3", Platform.PERPLEXITY, "Focus modes", "Research", "Narrow retrieval (academic vs writing presets).", "Improves signal when you know the domain.", 2),
        v("pp-4", Platform.PERPLEXITY, "File upload", "Context", "Drop PDFs for grounded Q&A.", "Great for manuals and dense references.", 2),
        v("pp-5", Platform.PERPLEXITY, "Model selector", "Model", "Swap reasoning depth vs latency.", "Match model to question difficulty.", 1),
        v("pp-6", Platform.PERPLEXITY, "Mobile voice", "Input", "Dictate multi-step research prompts.", "Faster iteration on mobile.", 1),
        v("pp-7", Platform.PERPLEXITY, "Thread share", "Collab", "Share solved threads externally.", "Scrub attachments before publishing.", 1),
        v("pp-8", Platform.PERPLEXITY, "Rewrite tone", "Writing", "Make outputs tighter or friendlier.", "Pair with citations for factual edits.", 1),

        v("cp-1", Platform.COPILOT, "Win + C", "Shortcut", "Open Copilot overlay on Windows builds that support it.", "Shortcuts vary—verify yours.", 2),
        v("cp-2", Platform.COPILOT, "Edge sidebar", "Browser", "Assistant panel while browsing.", "Strong for summaries and drafts from tabs.", 2),
        v("cp-3", Platform.COPILOT, "365 Copilot", "Work", "In-app boosts across productivity apps.", "Admin licensing controls rollout.", 2),
        v("cp-4", Platform.COPILOT, "Prompt library", "Productivity", "Reuse approved starters.", "Helps governance teams.", 1),
        v("cp-5", Platform.COPILOT, "Image generation", "Media", "Visuals from descriptive prompts.", "Review policy for likeness and logos.", 1),
        v("cp-6", Platform.COPILOT, "Code completion", "Coding", "Inline completions in compatible IDEs.", "Always tests + human review.", 2),
        v("cp-7", Platform.COPILOT, "Voice input", "Input", "Speak long prompts hands-free.", "Use in quiet environments.", 1),
        v("cp-8", Platform.COPILOT, "Enterprise grounding", "RAG", "Ground answers with sanctioned corp docs.", "Improves internal trust surfaces.", 2),

        v("ms-1", Platform.MISTRAL, "La Plateforme", "API", "Hosted Mistral endpoints.", "Common EU-friendly alternative.", 2),
        v("ms-2", Platform.MISTRAL, "Le Chat", "Product", "Consumer chat UX.", "Great for iterative coding help.", 2),
        v("ms-3", Platform.MISTRAL, "Small / Large", "Model", "Pick cost vs capability.", "Bench on your workloads.", 1),
        v("ms-4", Platform.MISTRAL, "JSON mode", "API", "Structured JSON outputs.", "Bind with schemas.", 2),
        v("ms-5", Platform.MISTRAL, "Function calling", "API", "Tool proposals executed by your code.", "Standard agent glue.", 2),
        v("ms-6", Platform.MISTRAL, "Edge deployments", "Deploy", "Shrink models for constrained devices.", "Check redistribution terms.", 1),
        v("ms-7", Platform.MISTRAL, "Batch jobs", "API", "Throughput-friendly workloads.", "Use for enrichment pipelines.", 1),
        v("ms-8", Platform.MISTRAL, "Safety tiers", "Policy", "Moderation presets.", "Match regulated workloads.", 1),

        v("ds-1", Platform.DEEPSEEK, "DeepSeek Chat", "Product", "Web chat for frontier models.", "Consult model cards.", 2),
        v("ds-2", Platform.DEEPSEEK, "Reasoning mode", "Model", "Higher compute reasoning path.", "Watch tokens and timeouts.", 2),
        v("ds-3", Platform.DEEPSEEK, "Completions API", "API", "classic prompt workflows.", "Cache stable prefixes.", 2),
        v("ds-4", Platform.DEEPSEEK, "System prompt hygiene", "Quality", "Short declarative steering.", "Cuts hallucinations.", 1),
        v("ds-5", Platform.DEEPSEEK, "Context budgeting", "Context", "Front-load anchor facts.", "Stale turns cost quality.", 1),
        v("ds-6", Platform.DEEPSEEK, "Streaming", "API", "Partial tokens UX.", "Be careful parsing JSON streams.", 1),
        v("ds-7", Platform.DEEPSEEK, "Key rotation", "Security", "Secrets live off-device.", "Never ship keys in clients.", 2),
        v("ds-8", Platform.DEEPSEEK, "Backoff on 429", "Ops", "Exponential backoff with jitter.", "Protect SLAs.", 1),

        v("gk-1", Platform.GROK, "Realtime tone", "Product", "Conversational, spicy defaults.", "Fact-check externally for high stakes.", 2),
        v("gk-2", Platform.GROK, "Social tie-in", "Context", "Optional trending context rails.", "Respect geography and authentication.", 1),
        v("gk-3", Platform.GROK, "Vision uploads", "Vision", "Interpret memes/screenshots.", "Avoid harassment automation.", 1),
        v("gk-4", Platform.GROK, "Plan tiers", "Billing", "Feature gates move with SKU.", "Re-read roadmap notes often.", 1),
        v("gk-5", Platform.GROK, "API roadmap", "API", "Treat availability as provisional until stable.", "Read ToS tightly.", 1),
        v("gk-6", Platform.GROK, "Personality rails", "UX", "Tone presets differ by shell.", "Document which build you captured.", 1),
        v("gk-7", Platform.GROK, "Export chats", "Collab", "Copy/paste archiving.", "Strip secrets manually.", 1),
        v("gk-8", Platform.GROK, "Mobile gestures", "Navigation", "Shortcuts flip between OS skins.", "Update shortcut tables often.", 1),
    )

    private fun v(
        id: String,
        platform: Platform,
        name: String,
        category: String,
        short: String,
        detail: String,
        weight: Int,
    ) = VaultCommand(id, platform, name, short, detail, category, weight)

    val all: List<VaultCommand> = claudeCommands() + otherCommands()

    fun forPlatform(platform: Platform): List<VaultCommand> = all.filter { it.platform == platform }

    fun sessionBundles(random: Random = Random.Default): SessionBundles {
        val featured = pickWeightedUnique(all, 7, random)
        val trending = all.shuffled(random).take(9)
        val recommended = pickWeightedUnique(all.shuffled(random), 6, random)
        val quick = Platform.entries.map { p ->
            all.filter { it.platform == p }.randomOrNull(random)
        }.filterNotNull()
        return SessionBundles(featured, trending, recommended, quick)
    }

    private fun <T> List<T>.randomOrNull(random: Random): T? = if (isEmpty()) null else this[random.nextInt(size)]

    private fun pickWeightedUnique(items: List<VaultCommand>, n: Int, random: Random): List<VaultCommand> {
        val pool = items.shuffled(random).sortedByDescending { it.weight }
        val out = ArrayList<VaultCommand>(n)
        val seen = HashSet<String>()
        for (cmd in pool) {
            if (!seen.add(cmd.id)) continue
            out += cmd
            if (out.size >= n) break
        }
        return out
    }
}

data class SessionBundles(
    val featured: List<VaultCommand>,
    val trending: List<VaultCommand>,
    val recommended: List<VaultCommand>,
    val quick: List<VaultCommand>,
)
