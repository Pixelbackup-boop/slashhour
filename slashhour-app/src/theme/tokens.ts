/**
 * Design Tokens - Colors & Typography
 *
 * Separated from theme/index.ts to avoid circular dependencies
 * with paperTheme.ts
 */

import { FONT_SIZES } from '../utils/responsive';

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
 * Get colors based on theme mode
 * Moved here to avoid circular dependency with theme/index.ts
 */
export const getColors = (isDark: boolean) => isDark ? COLORS_DARK : COLORS_LIGHT;
