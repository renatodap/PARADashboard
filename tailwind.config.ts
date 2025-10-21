import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "4%",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      colors: {
        // PARA Color System (2026)
        para: {
          project: {
            DEFAULT: "#7C3AED",
            light: "#9F7AEA",
            dark: "#6D28D9",
          },
          area: {
            DEFAULT: "#22D3EE",
            light: "#67E8F9",
            dark: "#0891B2",
          },
          resource: {
            DEFAULT: "#FBBF24",
            light: "#FCD34D",
            dark: "#F59E0B",
          },
          archive: {
            DEFAULT: "#F472B6",
            light: "#F9A8D4",
            dark: "#EC4899",
          },
        },
        // Base Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#7C3AED",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E2E8F0",
          foreground: "#1E293B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#1E293B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "20px",
        xl: "28px",
        "2xl": "32px",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.4rem", { lineHeight: "1.6" }],
        "2xl": ["1.8rem", { lineHeight: "1.5" }],
        "3xl": ["2.4rem", { lineHeight: "1.4" }],
        "4xl": ["2.8rem", { lineHeight: "1.3" }],
      },
      fontFamily: {
        sans: ["Inter", "SF Pro", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        heading: ["Sora", "SF Pro Rounded", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)",
        DEFAULT: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        md: "0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
        lg: "0 20px 48px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.08)",
        project: "0 8px 24px rgba(124,58,237,0.15)",
        area: "0 8px 24px rgba(34,211,238,0.15)",
        resource: "0 8px 24px rgba(251,191,36,0.15)",
        archive: "0 8px 24px rgba(244,114,182,0.15)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        scaleIn: "scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 0.5s ease-in-out",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
