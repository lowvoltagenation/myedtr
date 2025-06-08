/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cyan: {
          50: '#f0fdff',
          100: '#ccfbfe',
          200: '#9ef5fd',
          300: '#66ecfb',
          400: '#1dd8f3',
          500: '#00dbf9',
          600: '#00b5d1',
          700: '#0491a7',
          800: '#0b7485',
          900: '#0e616f',
        },
        magenta: {
          50: '#fef7ff',
          100: '#fceeff',
          200: '#f9dcfe',
          300: '#f5bffd',
          400: '#ee93fa',
          500: '#e744f6',
          600: '#d61ae6',
          700: '#b810c8',
          800: '#9812a3',
          900: '#7c1582',
        },
        purple: {
          50: '#f6f4ff',
          100: '#eeebff',
          200: '#ddd9ff',
          300: '#c4baff',
          400: '#a992ff',
          500: '#8f65ff',
          600: '#862dfb',
          700: '#7726df',
          800: '#611eb7',
          900: '#511a94',
        },
        'deep-blue': {
          50: '#f0f2ff',
          100: '#e4e7ff',
          200: '#cdd3ff',
          300: '#a6b1ff',
          400: '#7782ff',
          500: '#4c51ff',
          600: '#2e2af7',
          700: '#1e19e3',
          800: '#1815c0',
          900: '#02044f',
        },
        'light-pink': {
          50: '#fdf6fb',
          100: '#fbedf8',
          200: '#f8dcf2',
          300: '#f3c0e8',
          400: '#ec98d8',
          500: '#f5b7d2',
          600: '#d883b8',
          700: '#c5689c',
          800: '#a35781',
          900: '#864a6a',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

