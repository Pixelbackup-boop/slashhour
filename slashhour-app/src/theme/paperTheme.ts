/**
 * React Native Paper Theme Configuration
 * Integrates Paper components with Slashhour design system
 *
 * Material Design 3 (MD3) compliant theme for React Native Paper
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { COLORS_LIGHT, COLORS_DARK, TYPOGRAPHY, RADIUS } from './index';

/**
 * Custom fonts configuration for Paper
 * Maps our design system fonts to Paper's font variants
 */
const fontConfig = {
  displayLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.xxxl * 1.2,
  },
  displayMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.xxl * 1.2,
  },
  displaySmall: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.2,
  },
  headlineLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.xxl * 1.3,
  },
  headlineMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.3,
  },
  headlineSmall: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.3,
  },
  titleLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.3,
  },
  titleMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    letterSpacing: 0.15,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.3,
  },
  titleSmall: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    letterSpacing: 0.1,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.3,
  },
  labelLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0.5,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
  },
  labelMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    letterSpacing: 0.5,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.5,
  },
  labelSmall: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    letterSpacing: 0.5,
    lineHeight: TYPOGRAPHY.fontSize.xs * 1.5,
  },
  bodyLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    letterSpacing: 0.5,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
  },
  bodyMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    letterSpacing: 0.25,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
  },
  bodySmall: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    letterSpacing: 0.4,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.5,
  },
  default: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
  },
} as const;

/**
 * Slashhour Paper Theme
 * Extends Material Design 3 theme with our brand colors
 */
export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  // @ts-ignore - Paper v5 uses different type structure
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,

    // Primary colors (Slashhour brand red)
    primary: COLORS_LIGHT.primary,
    primaryContainer: COLORS_LIGHT.primaryBackground,
    onPrimary: COLORS_LIGHT.white,
    onPrimaryContainer: COLORS_LIGHT.primaryDark,

    // Secondary colors (Slashhour teal)
    secondary: COLORS_LIGHT.secondary,
    secondaryContainer: '#E0F7F5',
    onSecondary: COLORS_LIGHT.white,
    onSecondaryContainer: COLORS_LIGHT.secondaryDark,

    // Tertiary colors
    tertiary: COLORS_LIGHT.info,
    tertiaryContainer: '#E3F2FD',
    onTertiary: COLORS_LIGHT.white,
    onTertiaryContainer: COLORS_LIGHT.infoDark,

    // Error colors
    error: COLORS_LIGHT.error,
    errorContainer: '#FFEBEE',
    onError: COLORS_LIGHT.white,
    onErrorContainer: COLORS_LIGHT.errorDark,

    // Background colors
    background: COLORS_LIGHT.background,
    onBackground: COLORS_LIGHT.textPrimary,

    // Surface colors
    surface: COLORS_LIGHT.white,
    surfaceVariant: COLORS_LIGHT.gray100,
    onSurface: COLORS_LIGHT.textPrimary,
    onSurfaceVariant: COLORS_LIGHT.textSecondary,
    surfaceDisabled: COLORS_LIGHT.gray200,
    onSurfaceDisabled: COLORS_LIGHT.textDisabled,

    // Outline colors
    outline: COLORS_LIGHT.border,
    outlineVariant: COLORS_LIGHT.borderLight,

    // Other colors
    shadow: COLORS_LIGHT.shadow,
    scrim: COLORS_LIGHT.overlay,
    inverseSurface: COLORS_LIGHT.gray800,
    inverseOnSurface: COLORS_LIGHT.white,
    inversePrimary: COLORS_LIGHT.primaryLight,

    // Elevation (for shadows)
    elevation: {
      level0: 'transparent',
      level1: COLORS_LIGHT.white,
      level2: COLORS_LIGHT.white,
      level3: COLORS_LIGHT.white,
      level4: COLORS_LIGHT.white,
      level5: COLORS_LIGHT.white,
    },

    // Backdrop
    backdrop: COLORS_LIGHT.overlay,
  },
  roundness: RADIUS.md,
};

/**
 * Slashhour Dark Theme
 * OLED-optimized dark theme with proper contrast ratios
 */
export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  // @ts-ignore - Paper v5 uses different type structure
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,

    // Primary colors (Slashhour brand red - adjusted for dark mode)
    primary: COLORS_DARK.primary,
    primaryContainer: COLORS_DARK.primaryBackground,
    onPrimary: COLORS_DARK.black,
    onPrimaryContainer: COLORS_DARK.primaryLight,

    // Secondary colors (Slashhour teal - brighter for dark mode)
    secondary: COLORS_DARK.secondary,
    secondaryContainer: '#1A3D3A',
    onSecondary: COLORS_DARK.black,
    onSecondaryContainer: COLORS_DARK.secondaryLight,

    // Tertiary colors
    tertiary: COLORS_DARK.info,
    tertiaryContainer: '#1A2D3D',
    onTertiary: COLORS_DARK.black,
    onTertiaryContainer: COLORS_DARK.infoLight,

    // Error colors
    error: COLORS_DARK.error,
    errorContainer: '#3D1A1A',
    onError: COLORS_DARK.black,
    onErrorContainer: COLORS_DARK.errorLight,

    // Background colors (Pure black for OLED)
    background: COLORS_DARK.background,
    onBackground: COLORS_DARK.textPrimary,

    // Surface colors (Elevated surfaces)
    surface: COLORS_DARK.backgroundTertiary,
    surfaceVariant: COLORS_DARK.gray200,
    onSurface: COLORS_DARK.textPrimary,
    onSurfaceVariant: COLORS_DARK.textSecondary,
    surfaceDisabled: COLORS_DARK.gray300,
    onSurfaceDisabled: COLORS_DARK.textDisabled,

    // Outline colors (Subtle borders)
    outline: COLORS_DARK.border,
    outlineVariant: COLORS_DARK.borderLight,

    // Other colors
    shadow: COLORS_DARK.shadow,
    scrim: COLORS_DARK.overlay,
    inverseSurface: COLORS_DARK.white,
    inverseOnSurface: COLORS_DARK.black,
    inversePrimary: COLORS_DARK.primaryDark,

    // Elevation (for shadows - darker in dark mode)
    elevation: {
      level0: 'transparent',
      level1: COLORS_DARK.backgroundSecondary,
      level2: COLORS_DARK.backgroundTertiary,
      level3: COLORS_DARK.gray200,
      level4: COLORS_DARK.gray300,
      level5: COLORS_DARK.gray300,
    },

    // Backdrop
    backdrop: COLORS_DARK.overlay,
  },
  roundness: RADIUS.md,
};

export default paperTheme;
