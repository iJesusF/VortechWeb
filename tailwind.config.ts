import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#070b12",
        navy: "#071a33",
        cyanx: "#13d8ff",
        steel: "#9fb3c8",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 45px rgba(19, 216, 255, 0.22)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.38)",
      },
      backgroundImage: {
        "radial-cyan": "radial-gradient(circle at center, rgba(19,216,255,.2), transparent 45%)",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: "0.25", transform: "scaleX(0.65)" },
          "50%": { opacity: "1", transform: "scaleX(1)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
