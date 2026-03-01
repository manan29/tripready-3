import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // Dark backgrounds
        dark: {
          primary: '#080F0E',
          secondary: '#0D1716',
          tertiary: '#121F1E',
          elevated: '#162624',
        },
        // Bright Teal
        primary: {
          50: '#EFFEFA',
          100: '#C6FBF1',
          200: '#8EF7E4',
          300: '#4DEAD3',
          400: '#14B8A6',
          500: '#0D9488',
          600: '#0A7A6E',
          700: '#08524D',
          800: '#0B413E',
          900: '#0D3634',
        },
        // Gold
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#F5A623',
          500: '#D97706',
          600: '#B45309',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          disabled: '#475569',
        },
        // Borders
        border: {
          subtle: '#1E2D2B',
          default: '#2A3B39',
          strong: '#3D4F4D',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        // Dark shadows
        'dark-sm': '0 2px 4px rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 8px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 12px 24px rgba(0, 0, 0, 0.6)',
        // Glow shadows
        'glow-sm': '0 0 10px rgba(20, 184, 166, 0.3)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
        'glow-lg': '0 0 30px rgba(20, 184, 166, 0.5), 0 0 60px rgba(20, 184, 166, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 166, 35, 0.4), 0 0 40px rgba(245, 166, 35, 0.2)',
      },
      dropShadow: {
        glow: '0 0 10px rgba(20, 184, 166, 0.5)',
        'glow-lg': '0 0 20px rgba(20, 184, 166, 0.7)',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(20, 184, 166, 0.6), 0 0 60px rgba(20, 184, 166, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
