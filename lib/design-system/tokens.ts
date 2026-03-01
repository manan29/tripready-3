// JourneyAI Design System - Tokens
// Inspired by: Airbnb warmth + Apple cleanliness + CRED polish

export const tokens = {
  // ═══════════════════════════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════════════════════════
  colors: {
    // Primary - Deep Teal (Trust, Travel, Calm)
    primary: {
      50: '#EFFEFA',
      100: '#C6FBF1',
      200: '#8EF7E4',
      300: '#4DEAD3',
      400: '#1AD4BE',
      500: '#0A7A6E', // Main brand
      600: '#066660',
      700: '#08524D',
      800: '#0B413E',
      900: '#0D3634',
    },

    // Neutral - Warm grays (not cold)
    neutral: {
      0: '#FFFFFF',
      25: '#FDFCFB',   // Warmest white
      50: '#FAF9F7',   // Paper white
      100: '#F5F3F0',  // Light warm gray
      200: '#E8E6E3',
      300: '#D4D2CF',
      400: '#A8A5A0',
      500: '#7C7975',
      600: '#5C5955',
      700: '#434240',
      800: '#2D2C2A',
      900: '#1A1918',  // Rich black
    },

    // Accent colors
    coral: {
      50: '#FFF5F3',
      100: '#FFE8E3',
      500: '#FF6B5B',
      600: '#E5453A',
    },
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
    },
    sky: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      500: '#0EA5E9',
      600: '#0284C7',
    },
    violet: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      500: '#8B5CF6',
      600: '#7C3AED',
    },

    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  typography: {
    // Using Plus Jakarta Sans (geometric, friendly, modern)
    fontFamily: {
      display: '"Plus Jakarta Sans", system-ui, sans-serif',
      body: '"Plus Jakarta Sans", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },

    // Type scale (based on 1.25 ratio)
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
  // SHADOWS (Soft, layered)
  // ═══════════════════════════════════════════════════════════════
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)',
    '2xl': '0 32px 64px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.06)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    glow: {
      primary: '0 0 24px rgba(10, 122, 110, 0.25)',
      coral: '0 0 24px rgba(255, 107, 91, 0.25)',
      gold: '0 0 24px rgba(245, 158, 11, 0.25)',
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
