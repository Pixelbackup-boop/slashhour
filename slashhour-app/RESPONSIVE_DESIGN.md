# Responsive Design Foundation

## Overview

This document explains the responsive design system implemented in Slashhour. The foundation ensures the app looks and works perfectly across all iOS and Android devices, from small phones to tablets.

## Core Files

### 1. `/src/utils/responsive.ts`
Contains all responsive scaling utilities and device detection functions.

### 2. `/src/theme/index.ts`
Complete design system with colors, typography, spacing, and other design tokens.

---

## Responsive Utilities

### Scaling Functions

#### `scale(size: number)`
Scales values proportionally to screen width. Best for widths, heights, and borderRadius.

```typescript
import { scale } from '@/utils/responsive';

// Example: Scale a container width
width: scale(100)  // 100pt on iPhone 14 Pro, proportionally scaled on other devices
```

#### `moderateScale(size: number, factor?: number)`
Less aggressive scaling. Best for fonts, paddings, and margins (default factor: 0.5).

```typescript
import { moderateScale } from '@/utils/responsive';

// Example: Scale padding
padding: moderateScale(16)  // More subtle scaling than scale()
padding: moderateScale(20, 0.3)  // Even less aggressive with custom factor
```

#### `scaleFontSize(size: number)`
Font scaling that respects system font size settings.

```typescript
// Used internally by TYPOGRAPHY.fontSize
// You typically don't need to call this directly
```

### Device Detection

```typescript
import { isSmallDevice, isMediumDevice, isTablet } from '@/utils/responsive';

// Small devices: width < 375px (iPhone SE, older Android)
if (isSmallDevice) {
  // Adjust layout for small screens
}

// Medium devices: 375px ≤ width < 768px (most modern phones)
if (isMediumDevice) {
  // Standard phone layout
}

// Tablets: width ≥ 768px
if (isTablet) {
  // Tablet-optimized layout
}
```

### Conditional Values

#### `deviceSize<T>(values)`
Returns different values based on device size.

```typescript
import { deviceSize } from '@/utils/responsive';

const padding = deviceSize({
  small: 12,
  medium: 16,
  large: 24,
  default: 16
});
```

#### `platformValue<T>(values)`
Returns different values based on platform.

```typescript
import { platformValue } from '@/utils/responsive';

const height = platformValue({
  ios: 44,
  android: 56,
  default: 48
});
```

### Pre-defined Responsive Values

```typescript
import { SPACING, FONT_SIZES, BORDER_RADIUS, HIT_SLOP } from '@/utils/responsive';

// Spacing (based on 8pt grid)
SPACING.xs   // 4pt  (moderately scaled)
SPACING.sm   // 8pt
SPACING.md   // 16pt
SPACING.lg   // 24pt
SPACING.xl   // 32pt
SPACING.xxl  // 48pt

// Font Sizes (respects system font scale)
FONT_SIZES.xs    // 10pt
FONT_SIZES.sm    // 12pt
FONT_SIZES.md    // 14pt
FONT_SIZES.lg    // 16pt
FONT_SIZES.xl    // 18pt
FONT_SIZES.xxl   // 24pt
FONT_SIZES.xxxl  // 32pt

// Border Radius
BORDER_RADIUS.sm    // 4pt
BORDER_RADIUS.md    // 8pt
BORDER_RADIUS.lg    // 12pt
BORDER_RADIUS.xl    // 16pt
BORDER_RADIUS.round // 9999 (fully rounded)

// Touch Targets (ensures minimum 44pt touch area)
HIT_SLOP.sm  // { top: 8, right: 8, bottom: 8, left: 8 }
HIT_SLOP.md  // { top: 12, right: 12, bottom: 12, left: 12 }
HIT_SLOP.lg  // { top: 16, right: 16, bottom: 16, left: 16 }
```

---

## Theme System

### Colors

```typescript
import { COLORS } from '@/theme';

// Primary Brand Colors
COLORS.primary           // #FF6B6B (main brand color)
COLORS.primaryLight      // #FF8585
COLORS.primaryDark       // #E85555
COLORS.primaryBackground // #FFE8E8

// Secondary Colors
COLORS.secondary         // #4ECDC4
COLORS.secondaryLight    // #6FD9D1
COLORS.secondaryDark     // #3AB8AF

// Semantic Colors
COLORS.success           // #4CAF50
COLORS.warning           // #FFD93D
COLORS.error             // #F38181
COLORS.info              // #4A90E2

// Neutral Colors
COLORS.white             // #FFFFFF
COLORS.black             // #000000
COLORS.gray50 - gray800  // Full grayscale palette

// Background Colors
COLORS.background           // #FFFFFF
COLORS.backgroundSecondary  // #F5F5F5
COLORS.backgroundTertiary   // #F9F9F9

// Text Colors
COLORS.textPrimary       // #333333 (main text)
COLORS.textSecondary     // #666666 (secondary text)
COLORS.textTertiary      // #999999 (tertiary text)
COLORS.textDisabled      // #CCCCCC (disabled text)
COLORS.textInverse       // #FFFFFF (on dark backgrounds)

// Border Colors
COLORS.border            // #E0E0E0
COLORS.borderLight       // #EEEEEE
COLORS.borderDark        // #CCCCCC
```

### Typography

```typescript
import { TYPOGRAPHY } from '@/theme';

// Font Sizes (responsive)
TYPOGRAPHY.fontSize.xs
TYPOGRAPHY.fontSize.sm
TYPOGRAPHY.fontSize.md
TYPOGRAPHY.fontSize.lg
TYPOGRAPHY.fontSize.xl
TYPOGRAPHY.fontSize.xxl
TYPOGRAPHY.fontSize.xxxl

// Font Weights
TYPOGRAPHY.fontWeight.regular   // '400'
TYPOGRAPHY.fontWeight.medium    // '500'
TYPOGRAPHY.fontWeight.semibold  // '600'
TYPOGRAPHY.fontWeight.bold      // '700'

// Pre-composed Text Styles (recommended)
TYPOGRAPHY.styles.displayLarge   // Hero sections (32-40pt, bold)
TYPOGRAPHY.styles.displayMedium  // Hero sections (24-28pt, bold)
TYPOGRAPHY.styles.h1            // Headings (24-28pt, bold)
TYPOGRAPHY.styles.h2            // Headings (18-20pt, bold)
TYPOGRAPHY.styles.h3            // Headings (16-18pt, semibold)
TYPOGRAPHY.styles.body          // Body text (14-16pt, regular)
TYPOGRAPHY.styles.bodyLarge     // Large body (16-18pt, regular)
TYPOGRAPHY.styles.bodySmall     // Small body (12-14pt, regular)
TYPOGRAPHY.styles.label         // Labels (12-14pt, semibold, uppercase)
TYPOGRAPHY.styles.caption       // Captions (10-12pt, regular)
TYPOGRAPHY.styles.button        // Buttons (16-18pt, semibold)
TYPOGRAPHY.styles.buttonSmall   // Small buttons (14-16pt, semibold)
```

### Spacing

```typescript
import { SPACING } from '@/theme';

SPACING.xs   // 4pt  (based on responsive moderateScale)
SPACING.sm   // 8pt
SPACING.md   // 16pt
SPACING.lg   // 24pt
SPACING.xl   // 32pt
SPACING.xxl  // 48pt
```

### Border Radius

```typescript
import { RADIUS } from '@/theme';

RADIUS.none  // 0
RADIUS.sm    // 4-6pt (responsive)
RADIUS.md    // 8-10pt
RADIUS.lg    // 12-14pt
RADIUS.xl    // 16-20pt
RADIUS.round  // 9999 (fully rounded)
```

### Shadows

```typescript
import { SHADOWS } from '@/theme';

// iOS-style shadows with elevation for Android
SHADOWS.none  // No shadow
SHADOWS.sm    // Subtle shadow (cards)
SHADOWS.md    // Medium shadow (floating elements)
SHADOWS.lg    // Large shadow (modals)
SHADOWS.xl    // Extra large shadow (overlays)

// Usage
const styles = StyleSheet.create({
  card: {
    ...SHADOWS.md,
    backgroundColor: COLORS.white,
  },
});
```

### Component Sizes

```typescript
import { SIZES } from '@/theme';

// Button Heights
SIZES.button.sm  // 36pt
SIZES.button.md  // 44pt
SIZES.button.lg  // 52pt

// Input Heights
SIZES.input.sm   // 36pt
SIZES.input.md   // 44pt
SIZES.input.lg   // 52pt

// Icon Sizes
SIZES.icon.xs    // 16pt
SIZES.icon.sm    // 20pt
SIZES.icon.md    // 24pt
SIZES.icon.lg    // 32pt
SIZES.icon.xl    // 48pt

// Avatar Sizes
SIZES.avatar.sm  // 32pt
SIZES.avatar.md  // 48pt
SIZES.avatar.lg  // 64pt
SIZES.avatar.xl  // 96pt
```

### Layout Constants

```typescript
import { LAYOUT } from '@/theme';

LAYOUT.screenPadding      // 16pt (standard screen padding)
LAYOUT.cardPadding        // 16pt (card content padding)
LAYOUT.sectionSpacing     // 24pt (spacing between sections)
LAYOUT.maxContentWidth    // 768pt (max width for tablet layouts)
LAYOUT.tabBarHeight       // 60pt (base tab bar height)
LAYOUT.headerHeight       // 56pt (header height)
```

---

## Best Practices

### 1. Always Use Theme Tokens

❌ **Don't:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  text: {
    color: '#333',
    fontSize: 16,
  },
});
```

✅ **Do:**
```typescript
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  text: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textPrimary,
  },
});
```

### 2. Use Pre-composed Typography Styles

❌ **Don't:**
```typescript
const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31.2,
  },
});
```

✅ **Do:**
```typescript
const styles = StyleSheet.create({
  heading: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
  },
});
```

### 3. Use Safe Area Insets for Dynamic Padding

❌ **Don't:**
```typescript
tabBarStyle: {
  height: 95,
  paddingBottom: 35,  // Fixed padding doesn't work on all devices
}
```

✅ **Do:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MyComponent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom || SPACING.sm }}>
      {/* content */}
    </View>
  );
}
```

### 4. Account for Tab Bar in List Content

```typescript
import { LAYOUT, SPACING } from '@/theme';

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.md,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.xxl,  // Prevents content hiding behind floating tab bar
  },
});
```

### 5. Use Device-Specific Layouts When Needed

```typescript
import { isTablet, deviceSize } from '@/utils/responsive';

const styles = StyleSheet.create({
  container: {
    padding: deviceSize({
      small: SPACING.sm,
      medium: SPACING.md,
      large: SPACING.lg,
    }),
  },
});

// Or conditionally render different layouts
{isTablet ? <TabletLayout /> : <PhoneLayout />}
```

### 6. Ensure Minimum Touch Targets

```typescript
import { HIT_SLOP } from '@/utils/responsive';

<TouchableOpacity
  hitSlop={HIT_SLOP.md}  // Expands touch area for better UX
  onPress={handlePress}
>
  <Text>Small text</Text>
</TouchableOpacity>
```

---

## Migration Guide

### Converting Existing Screens

1. **Add imports:**
```typescript
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SIZES, LAYOUT } from '@/theme';
```

2. **Replace hardcoded colors:**
```typescript
// Before: backgroundColor: '#fff'
backgroundColor: COLORS.white

// Before: color: '#333'
color: COLORS.textPrimary
```

3. **Replace hardcoded spacing:**
```typescript
// Before: padding: 16
padding: SPACING.md

// Before: margin: 8
margin: SPACING.sm
```

4. **Replace font definitions:**
```typescript
// Before:
{
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 31.2,
}

// After:
{
  ...TYPOGRAPHY.styles.h1,
}
```

5. **Replace border radius:**
```typescript
// Before: borderRadius: 8
borderRadius: RADIUS.md
```

6. **Update shadows:**
```typescript
// Before:
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}

// After:
{
  ...SHADOWS.md,
}
```

---

## Testing Responsive Design

### Devices to Test On

**iOS:**
- iPhone SE (small device - 375x667)
- iPhone 14 Pro (medium device - 393x852) *base reference*
- iPhone 14 Pro Max (large phone - 430x932)
- iPad (tablet - 768x1024+)

**Android:**
- Small phone (< 375px width)
- Medium phone (375-768px width)
- Xiaomi 13 Pro (tested for gesture navigation)
- Tablet (≥ 768px width)

### Common Issues and Fixes

#### Issue: Tab bar hidden by gesture navigation
**Fix:** Use dynamic safe area insets
```typescript
const insets = useSafeAreaInsets();
paddingBottom: insets.bottom || SPACING.sm
```

#### Issue: Text too large/small on different devices
**Fix:** Use TYPOGRAPHY.fontSize which is already responsive
```typescript
fontSize: TYPOGRAPHY.fontSize.md  // Auto-scales across devices
```

#### Issue: Content hidden behind tab bar
**Fix:** Add extra padding to list content
```typescript
paddingBottom: LAYOUT.tabBarHeight + SPACING.xxl
```

#### Issue: Android TextInput text clipping (text cut off at 50%)
**Problem:** On Android devices (especially Xiaomi, Samsung), text in TextInput appears cut off when using fixed height with padding.

**Root Cause:**
- Android calculates text positioning differently than iOS
- Fixed height (44pt) - padding (16pt top + 16pt bottom) = only 12pt for 14-16pt font
- Android adds extra font padding by default

**Fix:** Apply Android-specific adjustments
```typescript
import { Platform } from 'react-native';

// Props on TextInput
<TextInput
  textAlignVertical="center"      // Centers text vertically (Android-only prop)
  includeFontPadding={false}      // Removes Android's extra font padding
  // ... other props
/>

// Styles
const styles = StyleSheet.create({
  input: {
    height: Platform.OS === 'android' ? 56 : SIZES.input.md,  // Taller on Android
    padding: SPACING.md,
    // ... other styles
  },
});
```

**Result:**
- iOS: Unchanged (44pt height works perfectly)
- Android: 56pt height provides enough space for text with padding

---

## Reference Dimensions

### Base Reference Device: iPhone 14 Pro
- Width: 393pt
- Height: 852pt
- Safe Area Bottom: ~34pt (on notched devices)

### Device Breakpoints
- **Small**: < 375pt width
- **Medium**: 375pt - 767pt width
- **Large (Tablet)**: ≥ 768pt width

---

## Additional Resources

- [Material Design 3](https://m3.material.io/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [Best Practices & UI/UX Trends](./best_practice_trends_UI_UX.md)

---

**Last Updated:** 2025-10-15
**Version:** 1.0.1
