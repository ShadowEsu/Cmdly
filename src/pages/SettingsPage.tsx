import { useSettings, type Accent, type FontSize } from "../context/SettingsContext";

export function SettingsPage() {
  const { fontSize, haptics, accent, setFontSize, setHaptics, setAccent } = useSettings();

  const sizes: FontSize[] = ["sm", "md", "lg"];
  const accents: Accent[] = ["violet", "cyan", "amber"];

  const chipBase =
    "flex-1 rounded-xl px-3 py-3 text-xs font-semibold ring-1 transition ring-vault-border min-h-[44px] flex items-center justify-center";
  const chipOn = "bg-vault-muted/15 text-vault-fg";
  const chipOff = "bg-vault-surface text-vault-muted hover:bg-vault-pill-bg";

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-vault-fg">Settings</h1>
          <p className="text-sm text-vault-muted">Type size, accents, and haptics.</p>
        </header>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-vault-fg">Font size</h2>
          <div className="mt-3 flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFontSize(s)}
                className={`${chipBase} ${fontSize === s ? chipOn : chipOff}`}
              >
                {s === "sm" ? "S" : s === "md" ? "M" : "L"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-vault-subtle">Small, Medium, or Large body scale.</p>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-vault-fg">Accent</h2>
          <p className="mt-1 text-xs text-vault-muted">Search focus ring and active tab highlight.</p>
          <div className="mt-3 flex gap-2">
            {accents.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccent(a)}
                className={`${chipBase} ${accent === a ? chipOn : chipOff} capitalize`}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-vault-fg">Haptic feedback</h2>
              <p className="mt-1 text-xs text-vault-muted">Short vibration when copy succeeds (supported devices).</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={haptics}
              onClick={() => setHaptics(!haptics)}
              className={`relative h-8 w-14 shrink-0 rounded-full ring-1 ring-vault-border transition ${
                haptics ? "bg-emerald-500/25 dark:bg-emerald-500/25" : "bg-vault-pill-bg"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-vault-elevated shadow ring-1 ring-vault-border transition dark:bg-white ${
                  haptics ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        <p className="text-xs text-vault-subtle">
          Reference data is illustrative—always confirm shortcuts against each vendor&apos;s current documentation.
        </p>
      </div>
    </div>
  );
}
