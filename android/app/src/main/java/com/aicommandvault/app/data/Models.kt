package com.aicommandvault.app.data

import androidx.compose.ui.graphics.Color

enum class Platform(
    val routeId: String,
    val label: String,
    val tagline: String,
    val accent: Color,
    val accentSoft: Color,
) {
    CLAUDE(
        routeId = "claude",
        label = "Claude",
        tagline = "Claude Code — Anthropic",
        accent = Color(0xFFC15F3C),
        accentSoft = Color(0x33C15F3C),
    ),
    CHATGPT(
        routeId = "chatgpt",
        label = "ChatGPT",
        tagline = "ChatGPT — OpenAI",
        accent = Color(0xFF10A37F),
        accentSoft = Color(0x3310A37F),
    ),
    CURSOR(
        routeId = "cursor",
        label = "Cursor",
        tagline = "Cursor — AI code editor",
        accent = Color(0xFFA8A29E),
        accentSoft = Color(0x33A8A29E),
    ),
    GEMINI(
        routeId = "gemini",
        label = "Gemini",
        tagline = "Gemini — Google AI",
        accent = Color(0xFF4285F4),
        accentSoft = Color(0x334285F4),
    ),
    LOVABLE(
        routeId = "lovable",
        label = "Lovable",
        tagline = "Lovable — AI app builder",
        accent = Color(0xFFFF4F8B),
        accentSoft = Color(0x33FF4F8B),
    ),
    PERPLEXITY(
        routeId = "perplexity",
        label = "Perplexity",
        tagline = "Perplexity — Answer engine",
        accent = Color(0xFF14B8A6),
        accentSoft = Color(0x3314B8A6),
    ),
    COPILOT(
        routeId = "copilot",
        label = "Copilot",
        tagline = "Microsoft Copilot",
        accent = Color(0xFF0078D4),
        accentSoft = Color(0x330078D4),
    ),
    MISTRAL(
        routeId = "mistral",
        label = "Mistral",
        tagline = "Mistral AI",
        accent = Color(0xFFFF7000),
        accentSoft = Color(0x33FF7000),
    ),
    DEEPSEEK(
        routeId = "deepseek",
        label = "DeepSeek",
        tagline = "DeepSeek",
        accent = Color(0xFF4D7CFE),
        accentSoft = Color(0x334D7CFE),
    ),
    GROK(
        routeId = "grok",
        label = "Grok",
        tagline = "Grok — xAI",
        accent = Color(0xFFF5F5F5),
        accentSoft = Color(0x24FFFFFF),
    ),
    ;

    companion object {
        fun fromRouteId(id: String): Platform? = entries.firstOrNull { it.routeId == id }
    }
}

data class VaultCommand(
    val id: String,
    val platform: Platform,
    val name: String,
    val short: String,
    val detail: String,
    val category: String,
    val weight: Int = 1,
)
