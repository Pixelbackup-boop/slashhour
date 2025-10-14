import { Dimensions, Platform, PixelRatio } from 'react-native';

/**
 * Responsive Design Utilities
 *
 * This file provides utilities for creating responsive layouts that work
 * across all iOS and Android devices, including tablets.
 *
 * Best Practices:
 * - Use scale() for widths/heights that should adapt to screen size
 * - Use moderateScale() for fonts and paddings (less aggressive scaling)
 * - Use isSmallDevice/isTablet for conditional rendering
 * - Always use SafeAreaView from 'react-native-safe-area-context'
 */

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Get current screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Device categorization
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Small devices (iPhone SE, older Android phones)
export const isSmallDevice = SCREEN_WIDTH < 375;

// Medium devices (most modern phones)
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;

// Tablets and large devices
export const isTablet = SCREEN_WIDTH >= 768;

/**
 * Scaling functions
 * Based on screen width ratio compared to base design
 */

/**
 * Scale a value proportionally to screen width
 * Best for: widths, heights, borderRadius
 *
 * @param size - The size from your design (based on iPhone 14 Pro: 393pt)
 * @returns Scaled size for current device
 *
 * @example
 * width: scale(100) // 100pt on iPhone 14 Pro, scales on other devices
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale a value proportionally to screen height
 * Best for: heights, vertical margins
 *
 * @param size - The size from your design
 * @returns Vertically scaled size
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - less aggressive scaling
 * Best for: fonts, paddings, margins
 *
 * @param size - The size from your design
 * @param factor - How much to scale (0 = no scaling, 1 = full scaling)
 * @returns Moderately scaled size
 *
 * @example
 * fontSize: moderateScale(16) // Scales less aggressively than scale()
 * padding: moderateScale(20, 0.3) // Even less aggressive scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Font scaling that respects system font size settings
 *
 * @param size - Font size in points
 * @returns Scaled font size respecting user preferences
 */
export const scaleFontSize = (size: number): number => {
  const normalized = moderateScale(size, 0.3);
  return Math.round(PixelRatio.roundToNearestPixel(normalized));
};

/**
 * Screen dimension utilities
 */
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,

  // Safe percentages for common use cases
  widthPercent: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  heightPercent: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,

  // Common breakpoints
  isSmall: isSmallDevice,
  isMedium: isMediumDevice,
  isLarge: isTablet,
};

/**
 * Conditional values based on device size
 *
 * @example
 * padding: deviceSize({ small: 12, medium: 16, large: 24 })
 */
export const deviceSize = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  default?: T;
}): T | undefined => {
  if (isSmallDevice && values.small !== undefined) return values.small;
  if (isTablet && values.large !== undefined) return values.large;
  if (isMediumDevice && values.medium !== undefined) return values.medium;
  return values.default;
};

/**
 * Platform-specific conditional values
 *
 * @example
 * height: platformValue({ ios: 44, android: 56 })
 */
export const platformValue = <T,>(values: {
  ios?: T;
  android?: T;
  default?: T;
}): T | undefined => {
  if (isIOS && values.ios !== undefined) return values.ios;
  if (isAndroid && values.android !== undefined) return values.android;
  return values.default;
};

/**
 * Utility to get appropriate padding for bottom elements
 * Accounts for gesture navigation on Android and home indicator on iOS
 *
 * @param base - Base padding to add on top of safe area
 * @returns Total bottom padding
 *
 * Note: Use useSafeAreaInsets() hook for dynamic values
 * This is for static StyleSheet definitions
 */
export const getBottomPadding = (base: number = 0): number => {
  if (isIOS) {
    return base; // SafeAreaView handles it
  }
  // Android gesture navigation (varies by device)
  return base + (isAndroid ? 20 : 0);
};

/**
 * Device info for debugging
 */
export const DEVICE_INFO = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  platform: Platform.OS,
  version: Platform.Version,
  isSmall: isSmallDevice,
  isMedium: isMediumDevice,
  isTablet: isTablet,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

/**
 * Log device info (useful for debugging)
 */
export const logDeviceInfo = () => {
  console.log('📱 Device Info:', DEVICE_INFO);
};

/**
 * Common responsive values (reusable)
 */
export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

export const FONT_SIZES = {
  xs: scaleFontSize(10),
  sm: scaleFontSize(12),
  md: scaleFontSize(14),
  lg: scaleFontSize(16),
  xl: scaleFontSize(18),
  xxl: scaleFontSize(24),
  xxxl: scaleFontSize(32),
};

export const BORDER_RADIUS = {
  sm: moderateScale(4),
  md: moderateScale(8),
  lg: moderateScale(12),
  xl: moderateScale(16),
  round: 9999,
};

/**
 * Responsive hitSlop for better touch targets
 * Ensures minimum 44pt touch target (iOS guideline)
 */
export const HIT_SLOP = {
  sm: { top: 8, right: 8, bottom: 8, left: 8 },
  md: { top: 12, right: 12, bottom: 12, left: 12 },
  lg: { top: 16, right: 16, bottom: 16, left: 16 },
};

export default {
  scale,
  verticalScale,
  moderateScale,
  scaleFontSize,
  SCREEN,
  deviceSize,
  platformValue,
  getBottomPadding,
  DEVICE_INFO,
  logDeviceInfo,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  HIT_SLOP,
  isIOS,
  isAndroid,
  isSmallDevice,
  isMediumDevice,
  isTablet,
};
