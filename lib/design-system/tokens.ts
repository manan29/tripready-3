// JourneyAI Design System v6.0 - Dark Teal Theme
// Premium dark theme with bright teal accents and gold highlights

export const tokens = {
  // ═══════════════════════════════════════════════════════════════
  // DARK COLORS
  // ═══════════════════════════════════════════════════════════════
  colors: {
    // Dark Backgrounds
    dark: {
      primary: '#080F0E',    // Deepest - main background
      secondary: '#0D1716',  // Cards/sections
      tertiary: '#121F1E',   // Hover states
      elevated: '#162624',   // Elevated cards
    },

    // Bright Teal - Primary accent (glowing)
    primary: {
      50: '#EFFEFA',
      100: '#C6FBF1',
      200: '#8EF7E4',
      300: '#4DEAD3',
      400: '#14B8A6',  // Main - bright teal
      500: '#0D9488',  // Hover
      600: '#0A7A6E',  // Active
      700: '#08524D',
      800: '#0B413E',
      900: '#0D3634',
    },

    // Gold - Premium accents
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#F5A623',  // Main gold
      500: '#D97706',  // Darker gold
      600: '#B45309',
    },

    // Text (light on dark)
    text: {
      primary: '#FFFFFF',     // Brightest text
      secondary: '#94A3B8',   // Muted text
      tertiary: '#64748B',    // Subtle text
      disabled: '#475569',
    },

    // Borders (subtle dark lines)
    border: {
      subtle: '#1E2D2B',
      default: '#2A3B39',
      strong: '#3D4F4D',
    },

    // Semantic Category Colors (for kids/adults/indian sections)
    category: {
      kids: {
        bg: 'rgba(251, 191, 36, 0.1)',    // Amber
        border: '#F59E0B',
        text: '#FCD34D',
      },
      adults: {
        bg: 'rgba(99, 102, 241, 0.1)',    // Indigo
        border: '#6366F1',
        text: '#A5B4FC',
      },
      indian: {
        bg: 'rgba(34, 197, 94, 0.1)',     // Emerald
        border: '#22C55E',
        text: '#86EFAC',
      },
    },

    // Semantic States
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Accent colors (for variety)
    coral: {
      50: '#FFF5F3',
      500: '#FF6B5B',
      600: '#E5453A',
    },
    violet: {
      50: '#F5F3FF',
      500: '#8B5CF6',
      600: '#7C3AED',
    },
    emerald: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
    },
    amber: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  typography: {
    fontFamily: {
      display: '"Plus Jakarta Sans", system-ui, sans-serif',
      body: '"Plus Jakarta Sans", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },

    fontSize: {
      '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
      '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
      '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // SPACING (4px base unit)
  // ═══════════════════════════════════════════════════════════════
  spacing: {
    0: '0',
    px: '1px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // ═══════════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════════
  radius: {
    none: '0',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    full: '9999px',
  },

  // ═══════════════════════════════════════════════════════════════
  // SHADOWS (Dark theme - deeper shadows)
  // ═══════════════════════════════════════════════════════════════
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.7)',
    '2xl': '0 32px 64px rgba(0, 0, 0, 0.8)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',

    // Glowing shadows for interactive elements
    glow: {
      primary: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
      gold: '0 0 20px rgba(245, 166, 35, 0.4), 0 0 40px rgba(245, 166, 35, 0.2)',
      sm: '0 0 10px rgba(20, 184, 166, 0.3)',
      lg: '0 0 30px rgba(20, 184, 166, 0.5), 0 0 60px rgba(20, 184, 166, 0.3)',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // ANIMATIONS
  // ═══════════════════════════════════════════════════════════════
  animation: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // BLUR
  // ═══════════════════════════════════════════════════════════════
  blur: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
  },
} as const;

export type Tokens = typeof tokens;
