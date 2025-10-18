/**
 * Design System & Theme
 *
 * Centralized design tokens for consistent UI across the app.
 * Following Material Design 3 and iOS Human Interface Guidelines.
 *
 * Usage:
 * import { COLORS, TYPOGRAPHY, SPACING } from '@/theme';
 */

import { SPACING as RESPONSIVE_SPACING, BORDER_RADIUS } from '../utils/responsive';
import { COLORS_LIGHT, COLORS_DARK, TYPOGRAPHY, getColors } from './tokens';

/**
 * Re-export color palettes and utilities
 */
export { COLORS_LIGHT, COLORS_DARK, TYPOGRAPHY, getColors };

/**
 * Default color export (Light mode)
 * Use getColors(isDark) for dynamic theme switching
 */
export const COLORS = COLORS_LIGHT;

/**
 * Spacing Scale
 * Consistent spacing using 8pt grid system
 */
export const SPACING = {
  xs: RESPONSIVE_SPACING.xs,      // 4pt
  sm: RESPONSIVE_SPACING.sm,      // 8pt
  md: RESPONSIVE_SPACING.md,      // 16pt
  lg: RESPONSIVE_SPACING.lg,      // 24pt
  xl: RESPONSIVE_SPACING.xl,      // 32pt
  xxl: RESPONSIVE_SPACING.xxl,    // 48pt
} as const;

/**
 * Border Radius Scale
 * Defined inline to avoid circular dependency
 */
export const RADIUS = {
  none: 0,
  sm: BORDER_RADIUS.sm,
  md: BORDER_RADIUS.md,
  lg: BORDER_RADIUS.lg,
  xl: BORDER_RADIUS.xl,
  round: 9999,
} as const;

/**
 * Shadows (Elevation)
 * iOS-style shadows
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Z-Index Scale
 * Consistent layering
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const;

/**
 * Animation Durations
 */
export const ANIMATION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

/**
 * Opacity Scale
 */
export const OPACITY = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
} as const;

/**
 * Common Component Sizes
 */
export const SIZES = {
  // Button heights
  button: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  // Avatar sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
} as const;

/**
 * Common Layout Values
 */
export const LAYOUT = {
  // Screen padding
  screenPadding: SPACING.md,

  // Card padding
  cardPadding: SPACING.md,

  // Section spacing
  sectionSpacing: SPACING.lg,

  // Max content width (for tablets)
  maxContentWidth: 768,

  // Tab bar height
  tabBarHeight: 60,

  // Header height
  headerHeight: 56,
} as const;

/**
 * Export complete theme object
 */
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  animation: ANIMATION,
  opacity: OPACITY,
  sizes: SIZES,
  layout: LAYOUT,
} as const;

export default THEME;
