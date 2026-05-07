import type { PlatformId } from "../types";

/**
 * Colors: aligned with public-facing brand cues (not official logo assets).
 * Typography: Anthropic/Styrene, OpenAI Sans, Google Sans, etc. are proprietary —
 * `uiFontStack` uses licensed Google Font substitutes loaded in index.html.
 */
export type PlatformMeta = {
  id: PlatformId;
  label: string;
  tagline: string;
  /** Primary accent hex */
  accent: string;
  accentSoft: string;
  gradient: string;
  /** CSS font-family for UI copy on platform pages */
  uiFontStack: string;
};

export const PLATFORMS: PlatformMeta[] = [
  {
    id: "claude",
    label: "Claude",
    tagline: "Claude Code — Anthropic",
    accent: "#C15F3C",
    accentSoft: "rgba(193, 95, 60, 0.26)",
    gradient: "from-[#4a2618] via-[#2a1610] to-vault-bg",
    uiFontStack: '"Source Sans 3", "DM Sans", system-ui, sans-serif',
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    tagline: "ChatGPT — OpenAI",
    accent: "#10A37F",
    accentSoft: "rgba(16, 163, 127, 0.28)",
    gradient: "from-[#06100d] via-[#0a1512] to-vault-bg",
    uiFontStack: '"Inter", system-ui, sans-serif',
  },
  {
    id: "cursor",
    label: "Cursor",
    tagline: "Cursor — AI code editor",
    accent: "#A8A29E",
    accentSoft: "rgba(228, 228, 231, 0.16)",
    gradient: "from-[#171717] via-[#0f0f0f] to-vault-bg",
    uiFontStack: '"Space Grotesk", "Inter", system-ui, sans-serif',
  },
  {
    id: "gemini",
    label: "Gemini",
    tagline: "Gemini — Google AI",
    accent: "#4285F4",
    accentSoft: "rgba(66, 133, 244, 0.28)",
    gradient: "from-[#1a2d4d] via-[#132238] to-vault-bg",
    uiFontStack: '"Plus Jakarta Sans", system-ui, sans-serif',
  },
  {
    id: "lovable",
    label: "Lovable",
    tagline: "Lovable — AI app builder",
    accent: "#FF4F8B",
    accentSoft: "rgba(255, 79, 139, 0.24)",
    gradient: "from-[#301826] via-[#160f14] to-vault-bg",
    uiFontStack: '"Nunito Sans", system-ui, sans-serif',
  },
  {
    id: "perplexity",
    label: "Perplexity",
    tagline: "Perplexity — Answer engine",
    accent: "#14B8A6",
    accentSoft: "rgba(20, 184, 166, 0.25)",
    gradient: "from-[#0f2522] via-[#0c1a18] to-vault-bg",
    uiFontStack: '"Outfit", system-ui, sans-serif',
  },
  {
    id: "copilot",
    label: "Copilot",
    tagline: "Microsoft Copilot",
    accent: "#0078D4",
    accentSoft: "rgba(0, 120, 212, 0.28)",
    gradient: "from-[#0a2033] via-[#0c1824] to-vault-bg",
    uiFontStack: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
  {
    id: "mistral",
    label: "Mistral",
    tagline: "Mistral AI",
    accent: "#FF7000",
    accentSoft: "rgba(255, 112, 0, 0.28)",
    gradient: "from-[#3d2208] via-[#201206] to-vault-bg",
    uiFontStack: '"Sora", "Outfit", system-ui, sans-serif',
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    tagline: "DeepSeek",
    accent: "#4D7CFE",
    accentSoft: "rgba(77, 124, 254, 0.28)",
    gradient: "from-[#121c38] via-[#0f1428] to-vault-bg",
    uiFontStack: '"IBM Plex Sans", system-ui, sans-serif',
  },
  {
    id: "grok",
    label: "Grok",
    tagline: "Grok — xAI",
    accent: "#F5F5F5",
    accentSoft: "rgba(255, 255, 255, 0.14)",
    gradient: "from-[#1c1c1c] via-[#101010] to-vault-bg",
    uiFontStack: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  },
];

export function platformById(id: PlatformId) {
  return PLATFORMS.find((p) => p.id === id)!;
}
