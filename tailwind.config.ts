import type { Config } from "tailwindcss";

/**
 * Design tokens live here + in app/globals.css (as CSS variables), never
 * scattered as raw hex values through components. Values match the
 * GadGexo Master Context brand palette exactly.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        gadgexo: {
          purple: "#8A2DFF",
          blue: "#4B7BFF",
          cyan: "#00D9FF",
          dark: "#050814",
          light: "#F7F8FB",
        },
      },
      backgroundImage: {
        "gadgexo-gradient": "linear-gradient(90deg, #8A2DFF 0%, #4B7BFF 55%, #00D9FF 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
