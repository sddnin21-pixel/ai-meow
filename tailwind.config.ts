import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        "muted-fg": "hsl(var(--muted-fg))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))"
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "9999px"
      },
      boxShadow: {
        sm: "0 1px 2px rgb(45 36 22 / 0.06)",
        md: "0 8px 24px rgb(45 36 22 / 0.08)",
        lg: "0 18px 50px rgb(45 36 22 / 0.12)",
        glow: "0 0 0 4px rgb(255 179 71 / 0.16)"
      },
      keyframes: {
        meowBounce: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-5px) rotate(-2deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)" }
        },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        dot: { "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.3" }, "30%": { transform: "translateY(-4px)", opacity: "1" } }
      },
      animation: {
        meow: "meowBounce 1.8s cubic-bezier(0.68,-0.55,0.265,1.55) infinite",
        blink: "blink 1s step-end infinite",
        dot: "dot 1.2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
