import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070a17",
        panel: "#10162a",
        line: "#26304a",
        violet: { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
        cyan: { 400: "#22d3ee", 500: "#06b6d4" }
      },
      boxShadow: {
        glow: "0 14px 50px rgba(99, 102, 241, .18)"
      }
    }
  },
  plugins: []
};

export default config;