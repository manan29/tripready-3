/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A7A6E',
          light: '#0D9488',
          dark: '#065F56',
          bg: '#F0FDFA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F7F5',
        },
        txt: {
          primary: '#1A1A1A',
          secondary: '#6B6B6B',
          tertiary: '#9CA3AF',
        },
        border: {
          light: '#E5E5E5',
          divider: '#F0F0F0',
        },
        status: {
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
