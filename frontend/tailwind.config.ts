import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "var(--parchment)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        rule: "var(--rule)",
        oxblood: "var(--oxblood)",
        gold: "var(--gold)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      boxShadow: {
        paper:
          "0 1px 2px rgba(33, 27, 22, 0.06), 0 18px 40px -20px rgba(33, 27, 22, 0.35)",
        inset: "inset 0 0 0 1px var(--rule)",
      },
    },
  },
  plugins: [],
};

export default config;
