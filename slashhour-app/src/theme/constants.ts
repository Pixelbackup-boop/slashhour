/**
 * Theme Constants
 *
 * Static design values that don't depend on responsive utilities.
 * Safe to import anywhere without circular dependencies.
 *
 * For responsive values, use RADIUS from theme/index.ts
 * For themed values in components, use useTheme() hook
 */

/**
 * Static Border Radius Values
 * These are approximations of the responsive values for use in StyleSheet.create()
 *
 * Note: For actual themed radius, use RADIUS from theme/index.ts in dynamic styles
 */
export const STATIC_RADIUS = {
  none: 0,
  sm: 4,   // Approximation of moderateScale(4)
  md: 8,   // Approximation of moderateScale(8)
  lg: 12,  // Approximation of moderateScale(12)
  xl: 16,  // Approximation of moderateScale(16)
  round: 9999,
} as const;

/**
 * Common Z-Index values for layering
 */
export const STATIC_Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const;

/**
 * Animation durations in milliseconds
 */
export const STATIC_ANIMATION = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;
