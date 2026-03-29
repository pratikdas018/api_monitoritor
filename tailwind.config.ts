import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: "#000000",
          950: "#050505",
          900: "#0A0A0A",
          800: "#111111",
          700: "#1A1A1A",
          600: "#222222",
          500: "#2A2A2A",
        },
        accent: {
          DEFAULT: "#3B82F6",
          bright: "#60A5FA",
          dim: "#1D4ED8",
          glow: "rgba(59,130,246,0.3)",
        },
        silver: {
          DEFAULT: "#A1A1AA",
          bright: "#E4E4E7",
          dim: "#52525B",
        },
        status: {
          up: "#22C55E",
          degraded: "#EAB308",
          down: "#EF4444",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          accent: "var(--text-accent)",
        },
        border: {
          DEFAULT: "var(--border)",
          bright: "var(--border-bright)",
          accent: "var(--border-accent)",
        },
        surface: {
          DEFAULT: "var(--black)",
          card: "var(--black-900)",
          muted: "var(--black-800)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "glow-pulse": "pulse 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(59,130,246,0.6)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      boxShadow: {
        accent: "0 0 20px rgba(59,130,246,0.35)",
        "accent-lg": "0 0 40px rgba(59,130,246,0.25)",
        success: "0 0 20px rgba(34,197,94,0.4)",
        danger: "0 0 20px rgba(239,68,68,0.4)",
      },
      borderRadius: {
        card: "var(--radius-lg)",
        btn: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;
