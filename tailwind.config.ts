import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#9b87f5",
          hover: "#7E69AB",
          light: "#E5DEFF",
        },
        secondary: {
          DEFAULT: "#8E9196",
          hover: "#6E59A5",
        },
        stats: {
          water: "#E3F2FD",
          steps: "#E8F5E9",
          calories: "#FFF3E0",
          health: "#F3E5F5",
        }
      },
      keyframes: {
        "scale-up": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "emoji-fall": {
          "0%": { 
            transform: "translateY(-100%) translateX(0)",
            opacity: "0"
          },
          "10%": {
            opacity: "1"
          },
          "100%": { 
            transform: "translateY(400%) translateX(var(--random-x))",
            opacity: "0"
          }
        }
      },
      animation: {
        "scale-up": "scale-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "emoji-fall": "emoji-fall 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;