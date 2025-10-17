/**
 * Design System & Theme
 *
 * Centralized design tokens for consistent UI across the app.
 * Following Material Design 3 and iOS Human Interface Guidelines.
 *
 * Usage:
 * import { COLORS, TYPOGRAPHY, SPACING } from '@/theme';
 */

import { SPACING as RESPONSIVE_SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/responsive';

/**
 * Color Palette - Light Mode
 * Based on Slashhour brand identity
 */
export const COLORS_LIGHT = {
  // Primary Brand Colors
  primary: '#FF6B6B',
  primaryLight: '#FF8585',
  primaryDark: '#E85555',
  primaryBackground: '#FFE8E8',

  // Secondary Colors
  secondary: '#4ECDC4',
  secondaryLight: '#6FD9D1',
  secondaryDark: '#3AB8AF',

  // Neutral Colors (Grayscale)
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9F9F9',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#4D4D4D',
  gray700: '#333333',
  gray800: '#1A1A1A',

  // Semantic Colors
  success: '#4CAF50',
  successLight: '#66BB6A',
  successDark: '#388E3C',

  warning: '#FFD93D',
  warningLight: '#FFE066',
  warningDark: '#F2C409',

  error: '#F38181',
  errorLight: '#F59E9E',
  errorDark: '#E85555',

  info: '#4A90E2',
  infoLight: '#6BA3E8',
  infoDark: '#3A7BC8',

  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F9F9F9',

  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  textInverse: '#FFFFFF',

  // Border Colors
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderDark: '#CCCCCC',

  // Overlay & Shadow
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

/**
 * Color Palette - Dark Mode
 * OLED-optimized dark theme for battery saving and reduced eye strain
 */
export const COLORS_DARK = {
  // Primary Brand Colors (slightly desaturated for dark mode)
  primary: '#FF7B7B',
  primaryLight: '#FF9999',
  primaryDark: '#E86666',
  primaryBackground: '#2A1414',

  // Secondary Colors (brighter for dark backgrounds)
  secondary: '#5EDDD4',
  secondaryLight: '#7FE4DB',
  secondaryDark: '#4AC9C0',

  // Neutral Colors (Inverted grayscale)
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#1A1A1A',  // Darkest
  gray100: '#1F1F1F',
  gray200: '#2A2A2A',
  gray300: '#3D3D3D',
  gray400: '#666666',
  gray500: '#999999',
  gray600: '#B3B3B3',
  gray700: '#CCCCCC',
  gray800: '#E0E0E0',  // Lightest

  // Semantic Colors (adjusted for dark mode visibility)
  success: '#5CBF60',
  successLight: '#7ACA7E',
  successDark: '#4AAA4E',

  warning: '#FFE066',
  warningLight: '#FFE885',
  warningDark: '#FFD84D',

  error: '#FF9999',
  errorLight: '#FFB3B3',
  errorDark: '#FF8080',

  info: '#5A9FED',
  infoLight: '#78B0F0',
  infoDark: '#4A8FDD',

  // Background Colors (True black for OLED)
  background: '#000000',           // Pure black for OLED
  backgroundSecondary: '#121212',  // Slightly elevated
  backgroundTertiary: '#1F1F1F',   // Cards & surfaces

  // Text Colors (High contrast for readability)
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  textDisabled: '#4D4D4D',
  textInverse: '#000000',

  // Border Colors (Subtle in dark mode)
  border: '#2A2A2A',
  borderLight: '#1F1F1F',
  borderDark: '#3D3D3D',

  // Overlay & Shadow
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * Default color export (Light mode)
 * Use getColors(isDark) for dynamic theme switching
 */
export const COLORS = COLORS_LIGHT;

/**
 * Get colors based on theme mode
 */
export const getColors = (isDark: boolean) => isDark ? COLORS_DARK : COLORS_LIGHT;

/**
 * Typography Scale
 * Font sizes, weights, and line heights
 */
export const TYPOGRAPHY = {
  // Font Families (can be customized)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes (responsive)
  fontSize: {
    xs: FONT_SIZES.xs,      // 10-12pt
    sm: FONT_SIZES.sm,      // 12-14pt
    md: FONT_SIZES.md,      // 14-16pt
    lg: FONT_SIZES.lg,      // 16-18pt
    xl: FONT_SIZES.xl,      // 18-20pt
    xxl: FONT_SIZES.xxl,    // 24-28pt
    xxxl: FONT_SIZES.xxxl,  // 32-40pt
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights (relative to font size)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text Styles (pre-composed)
  styles: {
    // Display (Hero sections)
    displayLarge: {
      fontSize: FONT_SIZES.xxxl,
      fontWeight: '700' as const,
      lineHeight: FONT_SIZES.xxxl * 1.2,
    },
    displayMedium: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700' as const,
      lineHeight: FONT_SIZES.xxl * 1.2,
    },

    // Headings
    h1: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700' as const,
      lineHeight: FONT_SIZES.xxl * 1.3,
    },
    h2: {
      fontSize: FONT_SIZES.xl,
      fontWeight: '700' as const,
      lineHeight: FONT_SIZES.xl * 1.3,
    },
    h3: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600' as const,
      lineHeight: FONT_SIZES.lg * 1.3,
    },

    // Body Text
    bodyLarge: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '400' as const,
      lineHeight: FONT_SIZES.lg * 1.5,
    },
    body: {
      fontSize: FONT_SIZES.md,
      fontWeight: '400' as const,
      lineHeight: FONT_SIZES.md * 1.5,
    },
    bodySmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '400' as const,
      lineHeight: FONT_SIZES.sm * 1.5,
    },

    // Labels & Captions
    label: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '400' as const,
      lineHeight: FONT_SIZES.xs * 1.5,
    },

    // Buttons
    button: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600' as const,
    },
    buttonSmall: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600' as const,
    },
  },
} as const;

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
 */
export const RADIUS = {
  none: 0,
  sm: BORDER_RADIUS.sm,   // 4-6pt
  md: BORDER_RADIUS.md,   // 8-10pt
  lg: BORDER_RADIUS.lg,   // 12-14pt
  xl: BORDER_RADIUS.xl,   // 16-20pt
  full: 9999,             // Fully rounded
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
