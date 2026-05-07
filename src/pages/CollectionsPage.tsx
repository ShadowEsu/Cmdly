import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CommandRow } from "../components/CommandRow";
import { ALL_COMMANDS } from "../data/commands";
import { useCollections } from "../context/CollectionsContext";

export function CollectionsPage() {
  const { savedIds } = useCollections();
  const saved = useMemo(() => ALL_COMMANDS.filter((c) => savedIds.has(c.id)), [savedIds]);

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-vault-fg">Saved</h1>
          <p className="text-sm text-vault-muted">Stored only on this device — use Save on any command card.</p>
        </header>

        {saved.length === 0 ? (
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-6">
            <p className="text-sm text-vault-muted">Nothing saved yet.</p>
            <Link
              className="mt-3 inline-block text-sm font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300"
              to="/"
            >
              Browse decks
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((cmd, i) => (
              <CommandRow key={cmd.id} cmd={cmd} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
