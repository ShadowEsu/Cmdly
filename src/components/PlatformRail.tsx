import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PLATFORMS } from "../data/platforms";
import { ALL_COMMANDS } from "../data/commands";

export function PlatformRail() {
  const nav = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-vault-fg">Platforms</h2>
          <p className="text-sm text-vault-muted">Swipe — each deck is themed.</p>
        </div>
      </div>
      <div ref={scrollRef} className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 pt-1">
        {PLATFORMS.map((p, i) => {
          const count = ALL_COMMANDS.filter((c) => c.platform === p.id).length;
          return (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 380, damping: 26 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav(`/platform/${p.id}`)}
              className={`snap-start shrink-0 w-[min(78vw,280px)] rounded-3xl border border-vault-border bg-gradient-to-br ${p.gradient} p-[1px] shadow-[0_16px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.45)]`}
              aria-label={`Open ${p.label} commands`}
            >
              <div className="rounded-[22px] bg-vault-elevated/95 p-4 backdrop-blur-md dark:bg-black/35">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-vault-pill-bg px-2.5 py-1 text-[11px] font-semibold ring-1 ring-vault-border dark:bg-black/30 dark:text-white/80">
                    {count} cmds
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-lg font-semibold tracking-tight text-vault-fg">{p.label}</div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-vault-muted">{p.tagline}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-vault-muted">Open library</span>
                  <span className="text-vault-subtle" aria-hidden>
                    →
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
