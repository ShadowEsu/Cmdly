import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Command } from "../types";

type Ctx = {
  savedIds: Set<string>;
  toggleSave: (cmd: Command) => void;
  isSaved: (id: string) => boolean;
};

const CollectionsContext = createContext<Ctx | null>(null);

const KEY = "ai-command-vault:saved";

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...savedIds]));
    } catch {
      /* ignore */
    }
  }, [savedIds]);

  const toggleSave = useCallback((cmd: Command) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cmd.id)) next.delete(cmd.id);
      else next.add(cmd.id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const value = useMemo(() => ({ savedIds, toggleSave, isSaved }), [savedIds, toggleSave, isSaved]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const v = useContext(CollectionsContext);
  if (!v) throw new Error("useCollections must be used within CollectionsProvider");
  return v;
}
