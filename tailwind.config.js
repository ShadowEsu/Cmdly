/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Crimson Pro", "system-ui", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        vault: {
          bg: "var(--color-vault-bg)",
          fg: "var(--color-vault-fg)",
          muted: "var(--color-vault-muted)",
          subtle: "var(--color-vault-subtle)",
          border: "var(--color-vault-border)",
          surface: "var(--color-vault-surface)",
          elevated: "var(--color-vault-elevated)",
          nav: "var(--color-vault-nav)",
          scrim: "var(--color-vault-scrim)",
          "pill-bg": "var(--color-vault-pill-inactive)",
          "pill-fg": "var(--color-vault-pill-active-fg)",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(99, 102, 241, 0.25)",
        "glow-sm": "0 0 12px rgba(255, 255, 255, 0.06)",
      },
    },
  },
  plugins: [],
};
