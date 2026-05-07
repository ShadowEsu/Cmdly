import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function GlowSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const nav = useNavigate();
  const ring = "focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_40px_rgba(139,92,246,0.12)]";

  return (
    <motion.div
      layout
      className={`relative rounded-2xl border border-vault-border bg-vault-surface p-1 backdrop-blur-xl transition-shadow duration-300 ${ring}`}
      animate={focus ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-vault-muted/10 via-transparent to-vault-muted/5 opacity-50 dark:opacity-40" />
      <div className="relative flex items-center gap-2 px-3 py-2.5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-vault-subtle"
          aria-hidden
        >
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const query = q.trim();
              nav(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
            }
          }}
          placeholder="Search commands, shortcuts, actions…"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-vault-fg placeholder:text-vault-subtle outline-none"
          aria-label="Search commands"
        />
        {q ? (
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs text-vault-muted hover:bg-vault-pill-bg hover:text-vault-fg"
            onClick={() => setQ("")}
          >
            Clear
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            const query = q.trim();
            nav(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
          }}
          className="rounded-xl bg-vault-muted/15 px-3 py-1.5 text-xs font-semibold text-vault-fg shadow-sm ring-1 ring-vault-border transition hover:bg-vault-pill-bg active:scale-[0.97] dark:bg-white/10 dark:hover:bg-white/15"
        >
          Go
        </button>
      </div>
    </motion.div>
  );
}
