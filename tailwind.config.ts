import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    // Default Tailwind breakpoints (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536)
    // already cover "small mobile → large desktop" — not overridden.
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-elevated": "hsl(var(--surface-elevated))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        error: { DEFAULT: "hsl(var(--error))", foreground: "hsl(var(--error-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        destructive: { DEFAULT: "hsl(var(--error))", foreground: "hsl(var(--error-foreground))" },
        gadgexo: { purple: "#8A2DFF", blue: "#4B7BFF", cyan: "#00D9FF", dark: "#050814", light: "#F7F8FB" },
      },
      backgroundImage: {
        "gadgexo-gradient": "linear-gradient(90deg, #8A2DFF 0%, #4B7BFF 55%, #00D9FF 100%)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.4)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.4)",
        md: "0 4px 12px -2px rgb(0 0 0 / 0.35)",
        lg: "0 12px 32px -6px rgb(0 0 0 / 0.4)",
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["1.75rem", { lineHeight: "1.25", fontWeight: "600" }],
        h3: ["1.375rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.55" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
        label: ["0.8125rem", { lineHeight: "1.3", fontWeight: "500" }],
      },
      transitionDuration: { fast: "120ms", base: "200ms", slow: "320ms" },
      zIndex: { header: "40", overlay: "50", modal: "60", toast: "70", tooltip: "80" },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-468px 0" }, "100%": { backgroundPosition: "468px 0" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
