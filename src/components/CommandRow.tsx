import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Command } from "../types";
import { platformById } from "../data/platforms";
import { useCollections } from "../context/CollectionsContext";
import { CopyIcon } from "./CopyIcon";

function BookmarkIcon({ filled, className, size = 20 }: { filled: boolean; className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={className}
      aria-hidden
    >
      <path
        d="M6 3h12a1 1 0 0 1 1 1v16.5L12 15.5 5 20.5V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommandRow({ cmd, index = 0 }: { cmd: Command; index?: number }) {
  const [open, setOpen] = useState(false);
  const { toggleSave, isSaved } = useCollections();
  const p = platformById(cmd.platform);
  const saved = isSaved(cmd.id);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      if ("vibrate" in navigator) navigator.vibrate(12);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-vault-border bg-vault-surface shadow-[var(--card-elev-shadow)] backdrop-blur-xl"
      style={{ boxShadow: `0 0 0 1px ${p.accentSoft} inset, var(--card-elev-shadow)` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.06] via-transparent to-transparent opacity-60 dark:from-white/[0.04]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px]" style={{ background: p.accent }} />
      <div
        role="button"
        tabIndex={0}
        className="relative flex w-full cursor-pointer items-start gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 dark:focus-visible:ring-white/25"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[16px] font-semibold tracking-tight text-vault-fg dark:[text-shadow:0_0_20px_rgba(255,255,255,0.08)]">
              {cmd.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-vault-border"
              style={{ backgroundColor: p.accentSoft, color: "var(--color-vault-fg)" }}
            >
              {cmd.category}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-vault-muted">{cmd.short}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ring-vault-border transition active:scale-[0.96] ${
              saved
                ? "bg-violet-500/15 text-violet-800 ring-violet-400/35 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-400/30"
                : "bg-vault-pill-bg text-vault-fg hover:bg-vault-muted/15 dark:hover:bg-white/10"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(cmd);
            }}
            aria-label={saved ? `Unsave ${cmd.name}` : `Save ${cmd.name}`}
          >
            <BookmarkIcon filled={saved} className="opacity-90" size={20} />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl bg-vault-pill-bg ring-1 ring-vault-border transition hover:bg-vault-muted/15 active:scale-[0.96] dark:hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              void copyText(cmd.name);
            }}
            aria-label={`Copy ${cmd.name}`}
          >
            <CopyIcon className="text-vault-fg opacity-85" size={20} />
          </button>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="grid h-11 w-11 place-items-center rounded-xl text-vault-subtle ring-1 ring-transparent transition group-hover:bg-vault-scrim"
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </motion.span>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-vault-border"
          >
            <div className="space-y-3 p-4 pt-3">
              <p className="text-sm leading-relaxed text-vault-muted">{cmd.detail}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-vault-muted/20 px-3 py-1.5 text-xs font-semibold text-vault-fg ring-1 ring-vault-border hover:bg-vault-pill-bg active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/14"
                  onClick={() => void copyText(cmd.detail)}
                >
                  <CopyIcon className="text-vault-muted" size={14} />
                  Copy details
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
