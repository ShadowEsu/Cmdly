import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CommandRow } from "../components/CommandRow";
import { commandsForPlatform } from "../data/commands";
import { PLATFORMS, platformById } from "../data/platforms";
import type { PlatformId } from "../types";

const VALID_PLATFORM_IDS = new Set(PLATFORMS.map((p) => p.id));

export function PlatformPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const focusId = (location.state as { focusId?: string } | null)?.focusId;

  const platform = id && VALID_PLATFORM_IDS.has(id as PlatformId) ? (id as PlatformId) : null;
  const meta = platform ? platformById(platform) : null;
  const cmds = useMemo(() => (platform ? commandsForPlatform(platform) : []), [platform]);

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(focusId);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusId, platform]);

  if (!platform || !meta) {
    return (
      <div className="p-6">
        <p className="text-vault-muted">Unknown platform.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-violet-600 dark:text-violet-300">
          Back home
        </Link>
      </div>
    );
  }

  const idx = PLATFORMS.findIndex((p) => p.id === platform);
  const prev = PLATFORMS[(idx - 1 + PLATFORMS.length) % PLATFORMS.length]!;
  const next = PLATFORMS[(idx + 1) % PLATFORMS.length]!;

  return (
    <div className={`min-h-0 flex-1 bg-gradient-to-b ${meta.gradient}`} style={{ fontFamily: meta.uiFontStack }}>
      <div className="border-b border-white/10 bg-black/25 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] text-zinc-100 backdrop-blur-md dark:border-white/[0.06] dark:bg-black/20">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/15 hover:bg-white/15 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-zinc-100" aria-hidden>
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{meta.label}</div>
            <div className="truncate text-lg font-semibold text-white">{meta.tagline}</div>
          </div>
          <div className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-zinc-100 ring-1 ring-white/15">
            {cmds.length} cmds
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-lg items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => nav(`/platform/${prev.id}`)}
            className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-zinc-100 ring-1 ring-white/15 hover:bg-white/15 min-h-[44px] flex items-center"
          >
            ← {prev.label}
          </button>
          <div className="flex items-center gap-1.5">
            {PLATFORMS.map((p) => (
              <span
                key={p.id}
                className={`h-1.5 w-1.5 rounded-full ${p.id === platform ? "bg-white" : "bg-white/25"}`}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => nav(`/platform/${next.id}`)}
            className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-zinc-100 ring-1 ring-white/15 hover:bg-white/15 min-h-[44px] flex items-center"
          >
            {next.label} →
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-3 px-4 py-5 pb-28">
        {cmds.map((c, i) => (
          <div
            key={c.id}
            id={c.id}
            className={
              focusId === c.id
                ? "scroll-mt-28 rounded-2xl ring-2 ring-violet-500/55 dark:ring-white/25"
                : ""
            }
          >
            <CommandRow cmd={c} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
