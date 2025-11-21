import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // C6 Bank Color Palette
        c6: {
          black: '#000000',
          yellow: {
            DEFAULT: '#FFD100',
            light: '#FFE066',
            dark: '#E6BB00',
          },
          gray: {
            50: '#F7F7F7',
            100: '#E8E8E8',
            200: '#D1D1D1',
            300: '#B0B0B0',
            400: '#888888',
            500: '#6D6D6D',
            600: '#5D5D5D',
            700: '#4F4F4F',
            800: '#2D2D2D',
            900: '#1A1A1A',
          },
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'c6': '20px',
        'c6-sm': '12px',
        'c6-lg': '24px',
      },
      boxShadow: {
        'c6': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'c6-lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'c6-yellow': '0 4px 20px rgba(255, 209, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;

