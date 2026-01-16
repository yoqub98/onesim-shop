// src/config/theme.js
// Centralized Design System Configuration for OneSIM

/**
 * DESIGN SYSTEM
 *
 * This file contains all design tokens for the OneSIM project.
 * All colors, fonts, spacing, and other design properties should be defined here
 * and imported throughout the application for consistency.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary Colors
  primary: {
    main: '#FE4F18',        // Primary Orange - Main brand color
    light: '#FF6B3D',       // Lighter orange for hover states
    dark: '#E44615',        // Darker orange for active states
    50: '#FFF4F0',          // Very light orange
    100: '#FFE5DC',         // Light orange background
    200: '#FFCAB9',         // Lighter orange
    300: '#FFAF96',         // Light-medium orange
    400: '#FF8460',         // Medium orange
    500: '#FE4F18',         // Main orange
    600: '#E44615',         // Dark orange
    700: '#C93D12',         // Darker orange
    800: '#A3320F',         // Very dark orange
    900: '#7D260B',         // Darkest orange
  },

  secondary: {
    main: '#151618',        // Dark Gray - Secondary brand color
    light: '#2D2F33',       // Lighter dark gray
    dark: '#0A0B0C',        // Darker gray/black
  },

  // Supporting Colors
  support: {
    main: '#E8E9EE',        // Light Gray - Supporting color
    light: '#F5F6F8',       // Very light gray
    dark: '#D1D3D9',        // Darker supporting gray
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Semantic Colors
  success: '#10B981',       // Green
  warning: '#F59E0B',       // Yellow
  error: '#EF4444',         // Red
  info: '#3B82F6',          // Blue
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fallback: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },
};

// ============================================================================
// SPACING & SIZING
// ============================================================================

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '5rem',    // 80px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Full rounded
};

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(254, 79, 24, 0.5)',
  none: 'none',

  // Custom shadows with brand colors
  primary: '0 10px 30px rgba(254, 79, 24, 0.3)',
  primaryHover: '0 20px 40px rgba(254, 79, 24, 0.4)',
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #FE4F18 0%, #E44615 100%)',
  hero: 'linear-gradient(137deg, #FD916A 6.42%, #7D7571 75.63%, #727272 100%)',
  heroOverlay: 'linear-gradient(137deg, rgba(253, 145, 106, 0.22) 6.42%, rgba(125, 117, 113, 0.22) 75.63%, rgba(114, 114, 114, 0.22) 100%)',
  dark: 'linear-gradient(135deg, #151618 0%, #1F2024 100%)',
  light: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export const TRANSITIONS = {
  fast: 'all 0.15s ease',
  base: 'all 0.3s ease',
  slow: 'all 0.5s ease',
  cubic: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px', // Extra large desktop
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
};

// ============================================================================
// COMPONENT-SPECIFIC STYLES
// ============================================================================

export const COMPONENTS = {
  button: {
    primary: {
      bg: COLORS.primary.main,
      color: COLORS.neutral.white,
      hoverBg: COLORS.primary.light,
      activeBg: COLORS.primary.dark,
      borderRadius: BORDER_RADIUS.full,
      shadow: SHADOWS.primary,
      hoverShadow: SHADOWS.primaryHover,
    },
    secondary: {
      bg: COLORS.secondary.main,
      color: COLORS.neutral.white,
      hoverBg: COLORS.secondary.light,
      activeBg: COLORS.secondary.dark,
      borderRadius: BORDER_RADIUS.full,
    },
    outlined: {
      bg: 'transparent',
      color: COLORS.primary.main,
      border: `2px solid ${COLORS.primary.main}`,
      hoverBg: COLORS.primary[50],
      borderRadius: BORDER_RADIUS.full,
    },
  },

  card: {
    bg: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS['2xl'],
    shadow: SHADOWS.base,
    hoverShadow: SHADOWS.xl,
    border: `1px solid ${COLORS.support.main}`,
  },

  input: {
    borderRadius: BORDER_RADIUS.lg,
    border: `1px solid ${COLORS.support.dark}`,
    focusBorder: `2px solid ${COLORS.primary.main}`,
  },
};

// ============================================================================
// EXPORT DEFAULT THEME OBJECT
// ============================================================================

const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  gradients: GRADIENTS,
  transitions: TRANSITIONS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  components: COMPONENTS,
};

export default theme;
