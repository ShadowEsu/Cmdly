import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const PREFS_KEY = "ai-command-vault:prefs";

export type FontSize = "sm" | "md" | "lg";
export type Accent = "violet" | "cyan" | "amber";
export type ThemeMode = "light" | "dark" | "system";

type Prefs = {
  theme: ThemeMode;
  fontSize: FontSize;
  haptics: boolean;
  accent: Accent;
};

const defaults: Prefs = {
  theme: "dark",
  fontSize: "lg",
  haptics: true,
  accent: "violet",
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...defaults,
      ...parsed,
      // Theme is locked to dark mode.
      theme: "dark",
    };
  } catch {
    return defaults;
  }
}

function applyDocumentTheme(mode: ThemeMode, systemDark: boolean) {
  void mode;
  void systemDark;
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
}

type Ctx = Prefs & {
  /** Resolved scheme after applying System preference */
  resolvedTheme: Exclude<ThemeMode, "system">;
  setTheme: (v: ThemeMode) => void;
  setFontSize: (v: FontSize) => void;
  setHaptics: (v: boolean) => void;
  setAccent: (v: Accent) => void;
};

const Ctx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = useMemo((): Exclude<ThemeMode, "system"> => {
    void systemPrefersDark;
    return "dark";
  }, [systemPrefersDark]);

  useEffect(() => {
    applyDocumentTheme(prefs.theme, systemPrefersDark);
  }, [prefs.theme, systemPrefersDark]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const setTheme = useCallback((theme: ThemeMode) => {
    // Theme is locked to dark mode.
    void theme;
    setPrefs((p) => ({ ...p, theme: "dark" }));
    applyDocumentTheme("dark", true);
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => setPrefs((p) => ({ ...p, fontSize })), []);

  const setHaptics = useCallback((haptics: boolean) => setPrefs((p) => ({ ...p, haptics })), []);

  const setAccent = useCallback((accent: Accent) => setPrefs((p) => ({ ...p, accent })), []);

  const value = useMemo(
    () => ({
      ...prefs,
      resolvedTheme,
      setTheme,
      setFontSize,
      setHaptics,
      setAccent,
    }),
    [prefs, resolvedTheme, setTheme, setFontSize, setHaptics, setAccent],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}

export const accentRing: Record<Accent, string> = {
  violet: "rgba(139, 92, 246, 0.45)",
  cyan: "rgba(34, 211, 238, 0.45)",
  amber: "rgba(251, 191, 36, 0.45)",
};
