import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CommandRow } from "../components/CommandRow";
import { ALL_COMMANDS } from "../data/commands";
import { PLATFORMS } from "../data/platforms";
import type { Command, PlatformId } from "../types";

const PLATFORM_FILTERS: Array<PlatformId | "all"> = ["all", ...PLATFORMS.map((p) => p.id)];

function score(cmd: Command, q: string): number {
  const hay = `${cmd.name} ${cmd.short} ${cmd.detail} ${cmd.category}`.toLowerCase();
  const needle = q.trim().toLowerCase();
  if (!needle) return 1;
  let sc = 0;
  if (cmd.name.toLowerCase().includes(needle)) sc += 6;
  if (cmd.short.toLowerCase().includes(needle)) sc += 3;
  if (cmd.detail.toLowerCase().includes(needle)) sc += 1;
  if (cmd.category.toLowerCase().includes(needle)) sc += 2;
  if (sc === 0 && hay.includes(needle)) sc = 1;
  return sc;
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [platform, setPlatform] = useState<PlatformId | "all">("all");

  const results = useMemo(() => {
    const needle = q.trim();
    const ranked = ALL_COMMANDS.map((c) => ({ c, sc: score(c, needle) }))
      .filter(({ c, sc }) => (platform === "all" ? true : c.platform === platform) && (needle ? sc > 0 : true))
      .sort((a, b) => b.sc - a.sc || (b.c.weight ?? 1) - (a.c.weight ?? 1));
    return ranked.map((r) => r.c);
  }, [q, platform]);

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-vault-fg">Search</h1>
          <p className="text-sm text-vault-muted">All decks at once — filters narrow the list as you type.</p>
        </header>

        <div className="rounded-2xl border border-vault-border bg-vault-surface p-2 backdrop-blur-xl">
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              setParams(v.trim() ? { q: v } : {});
            }}
            placeholder="Filter instantly…"
            className="w-full rounded-xl bg-transparent px-3 py-3 text-sm text-vault-fg outline-none placeholder:text-vault-subtle"
            aria-label="Search query"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-vault-border transition ${
                platform === p
                  ? "bg-vault-muted/30 text-vault-fg shadow-sm"
                  : "bg-vault-pill-bg text-vault-muted hover:bg-vault-scrim"
              }`}
            >
              {p === "all" ? "All" : PLATFORMS.find((x) => x.id === p)?.label ?? p}
            </button>
          ))}
        </div>

        <div className="text-xs text-vault-muted">{results.length} results</div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {results.map((cmd, i) => (
              <motion.div
                key={cmd.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: Math.min(i * 0.02, 0.18) }}
              >
                <CommandRow cmd={cmd} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 text-sm text-vault-muted">
              No matches. Try a shorter query or set the platform filter to All.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
