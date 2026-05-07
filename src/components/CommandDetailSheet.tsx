import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Command } from "../types";
import { platformById } from "../data/platforms";
import { useCollections } from "../context/CollectionsContext";
import { CopyIcon } from "./CopyIcon";

interface CommandDetailSheetProps {
  cmd: Command | null;
  onClose: () => void;
}

export function CommandDetailSheet({ cmd, onClose }: CommandDetailSheetProps) {
  const { toggleSave, isSaved } = useCollections();
  const [copied, setCopied] = useState(false);

  const p = cmd ? platformById(cmd.platform) : null;
  const saved = cmd ? isSaved(cmd.id) : false;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      if ("vibrate" in navigator) navigator.vibrate(12);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {cmd && p && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-lg rounded-t-[32px] border-t border-vault-border bg-vault-elevated p-6 pb-12 shadow-2xl"
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-vault-muted/20" />

            <header className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-vault-border"
                  style={{ backgroundColor: p.accentSoft, color: "var(--color-vault-fg)" }}
                >
                  {p.label} • {cmd.category}
                </span>
                <button
                  onClick={onClose}
                  className="rounded-full bg-vault-pill-bg p-2 text-vault-muted hover:bg-vault-scrim"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <h2 className="font-mono text-2xl font-bold tracking-tight text-vault-fg">
                {cmd.name}
              </h2>
              <p className="text-lg leading-relaxed text-vault-muted font-light">
                {cmd.short}
              </p>
            </header>

            <div className="mb-8 space-y-4">
              <div className="rounded-2xl bg-vault-surface p-4 ring-1 ring-vault-border">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-vault-subtle">Details</h3>
                <p className="text-[17.5px] leading-relaxed text-vault-fg font-light">
                  {cmd.detail}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleSave(cmd)}
                className={`flex h-14 items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] ${
                  saved
                    ? "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30"
                    : "bg-vault-pill-bg text-vault-fg ring-1 ring-vault-border"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M6 3h12a1 1 0 0 1 1 1v16.5L12 15.5 5 20.5V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                </svg>
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => copyText(cmd.name)}
                className="relative flex h-14 items-center justify-center gap-2 rounded-2xl bg-vault-fg text-vault-bg font-semibold transition active:scale-[0.98]"
              >
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -40, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-2xl ring-1 ring-black/10"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
                <CopyIcon size={20} />
                Copy
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
