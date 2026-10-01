import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // These read live CSS variables (set in globals.css / toggled by
        // ThemeToggle.tsx), so bg-ink, bg-bg, etc. respond to dark mode
        // automatically — no separate dark: variants needed.
        ink: "var(--ink)",
        bg: "var(--bg)",
        panel: "var(--panel)",
        line: "var(--line)",
        muted: "#6B675E", // kept static — legible in both themes
        protein: "#C4443A",
        carbs: "#D9A441",
        fat: "#5B7A6B",
        neutral: "#8C8477",
      },
      fontFamily: {
        display: ["Space Grotesk", "Archivo", "sans-serif"],
        body: ["Public Sans", "Inter", "sans-serif"],
      },
      borderRadius: { DEFAULT: "6px" },
    },
  },
  plugins: [],
};
export default config;
