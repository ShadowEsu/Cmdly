import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ParticleGrid } from "../components/ParticleGrid";
import { GlowSearch } from "../components/GlowSearch";
import { PlatformRail } from "../components/PlatformRail";
import { CommandConstellation } from "../components/CommandConstellation";
import { CommandDetailSheet } from "../components/CommandDetailSheet";
import { ALL_COMMANDS } from "../data/commands";
import { PLATFORMS, platformById } from "../data/platforms";
import { pickWeightedUnique, shuffle } from "../lib/shuffle";
import type { Command } from "../types";

const GREETING = "Hello, Coder!" as const;

function MiniCommandCard({ cmd, delay, onSelect }: { cmd: Command; delay: number; onSelect: (cmd: Command) => void }) {
  const p = platformById(cmd.platform);
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 420, damping: 28 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(cmd)}
      className="group relative w-[220px] shrink-0 overflow-hidden rounded-2xl border border-vault-border bg-vault-surface p-3 text-left backdrop-blur-xl"
      style={{ boxShadow: `0 0 0 1px ${p.accentSoft} inset, var(--card-elev-shadow)` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-60"
        style={{ background: p.accentSoft }}
      />
      <div className="relative space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-vault-pill-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-vault-muted ring-1 ring-vault-border">
            {p.label}
          </span>
          <span className="text-[11px] text-vault-subtle">Tap</span>
        </div>
        <div className="font-mono text-base font-semibold text-vault-fg">{cmd.name}</div>
        <p className="line-clamp-2 text-sm leading-relaxed text-vault-muted">{cmd.short}</p>
      </div>
    </motion.button>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-1">
      <div>
        <h2 className="text-base font-semibold tracking-wide text-vault-fg">{title}</h2>
        <p className="text-sm text-vault-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-vault-border bg-vault-surface px-3 py-2 backdrop-blur-md"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-vault-muted">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-vault-fg">{value}</div>
    </motion.div>
  );
}

export function HomePage() {
  const nav = useNavigate();
  const [focusCmd, setFocusCmd] = useState<Command | null>(null);

  const bundles = useMemo(() => {
    const featured = pickWeightedUnique(ALL_COMMANDS, 7);
    const trending = shuffle(ALL_COMMANDS).slice(0, 9);
    const recommended = pickWeightedUnique(shuffle(ALL_COMMANDS), 8).slice(0, 6);
    const orbit = pickWeightedUnique(shuffle(ALL_COMMANDS), 10);
    const quick = PLATFORMS.map((p) => {
      const pool = ALL_COMMANDS.filter((c) => c.platform === p.id);
      return shuffle(pool)[0];
    }).filter(Boolean) as Command[];
    return { featured, trending, recommended, quick, orbit };
  }, []);

  const [pulse, setPulse] = useState(0);
  const total = ALL_COMMANDS.length;

  return (
    <div className="relative min-h-0 flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ParticleGrid />
      </div>

      <div className="relative space-y-8 px-4 pb-28 pt-6">
        <header className="space-y-2">
          <div className="text-center">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-[clamp(28px,7vw,42px)] font-semibold tracking-[0.18em] text-white">
                CMDLY
              </span>
              <span className="text-[clamp(18px,5vw,26px)] font-light tracking-tight text-white/70">.</span>
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="text-center font-light tracking-tight text-white text-[clamp(44px,10vw,56px)]"
          >
            {GREETING}
          </motion.h1>
        </header>

        <CommandConstellation
          commands={bundles.orbit}
          onCenterClick={() => nav("/search")}
          onSelectCommand={(cmd) => nav(`/platform/${cmd.platform}`, { state: { focusId: cmd.id } })}
        />

        <GlowSearch />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          <StatChip label="Commands" value={String(total)} />
          <StatChip label="Platforms" value={String(PLATFORMS.length)} />
          <StatChip label="Signals" value={`${bundles.featured.length}`} />
        </motion.div>

        <PlatformRail />

        <section>
          <SectionHeader title="Featured picks" subtitle="Weighted random + variety each load" />
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-1">
            {bundles.featured.map((cmd, i) => (
              <MiniCommandCard key={cmd.id} cmd={cmd} delay={0.04 * i} onSelect={setFocusCmd} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Trending shuffle" subtitle="Uniform random slice — fresh mix each time" />
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-1">
            {bundles.trending.map((cmd, i) => (
              <MiniCommandCard key={`t-${cmd.id}-${i}`} cmd={cmd} delay={0.02 * i} onSelect={setFocusCmd} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Recommended for you" subtitle="Higher-weight items first, then shuffle" />
          <div className="grid grid-cols-2 gap-3">
            {bundles.recommended.map((cmd, i) => (
              <motion.button
                key={cmd.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, type: "spring", stiffness: 380, damping: 26 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFocusCmd(cmd)}
                className="rounded-2xl border border-vault-border bg-vault-surface p-3 text-left backdrop-blur-xl"
                style={{ boxShadow: `0 0 0 1px ${platformById(cmd.platform).accentSoft} inset, var(--card-elev-shadow)` }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-vault-muted">
                  {platformById(cmd.platform).label}
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-vault-fg">{cmd.name}</div>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-vault-muted">{cmd.detail}</p>
              </motion.button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="One-tap per platform" subtitle="Random entry from each deck" />
          <div className="flex flex-col gap-2">
            {bundles.quick.map((cmd) => (
              <motion.button
                key={cmd.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setFocusCmd(cmd)}
                className="flex items-center justify-between rounded-2xl border border-vault-border bg-vault-surface px-4 py-3 text-left backdrop-blur-md"
              >
                <div>
                  <div className="text-[11px] font-semibold text-vault-muted">{platformById(cmd.platform).label}</div>
                  <div className="font-mono text-sm font-semibold text-vault-fg">{cmd.name}</div>
                </div>
                <span className="text-vault-subtle">→</span>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setPulse((n) => n + 1);
              nav("/search");
            }}
            className="rounded-full border border-vault-border bg-vault-surface px-4 py-2 text-xs font-semibold text-vault-fg backdrop-blur-md hover:bg-vault-pill-bg"
          >
            Jump to search {pulse ? `(${pulse})` : ""}
          </button>
        </div>
      </div>

      <motion.button
        type="button"
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-vault-border bg-gradient-to-br from-violet-500/25 to-cyan-500/15 text-vault-fg shadow-lg backdrop-blur-xl dark:from-violet-500/30 dark:to-cyan-400/20 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        whileTap={{ scale: 0.94 }}
        onClick={() => nav("/collections")}
        aria-label="Open saved collections"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </motion.button>

      <button
        type="button"
        className="fixed right-4 top-[calc(1rem+env(safe-area-inset-top))] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-vault-border bg-vault-surface/50 text-vault-muted backdrop-blur-xl transition hover:text-vault-fg"
        onClick={() => nav("/settings")}
        aria-label="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <CommandDetailSheet cmd={focusCmd} onClose={() => setFocusCmd(null)} />
    </div>
  );
}
