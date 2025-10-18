# Best Practices, Trends & UI/UX Guidelines

> **Purpose**: This document guides AI assistants and developers to proactively suggest and implement modern best practices, latest trends, and optimal UI/UX patterns - even when not explicitly requested.

**Last Updated**: 2025-10-15

---

## 📱 Mobile App Navigation Patterns

### Bottom Tab Bar (Recommended for Primary Navigation)
- **5 tabs maximum** - More causes cognitive overload
- **Center tab for primary action** - Middle position for create/post actions
- **Icons + labels** - Both for better accessibility and clarity
- **Active state indicators** - Clear visual feedback for current tab
- **Badge notifications** - Show counts on Profile/Inbox tabs
- **Haptic feedback** - Subtle vibration on tab switch (iOS/Android)

**Example Structure**:
```
[Home] [Search] [+ Create] [Inbox] [Profile]
```

### Navigation Stack Patterns
- **Modal presentations** - For temporary flows (create post, filters)
- **Full screen push** - For content deep-dives (deal details)
- **Back button consistency** - Always top-left, consistent label
- **Swipe to go back** - Enable gesture navigation (iOS standard)

---

## 🎨 Modern UI/UX Trends (2024-2025)

### Visual Design
1. **Glassmorphism** - Frosted glass effect for overlays (backdrop blur + transparency)
2. **Neumorphism** (use sparingly) - Soft shadows for primary cards
3. **Bold Typography** - Large, readable headings (20-32pt)
4. **High Contrast** - WCAG AAA compliance (7:1 ratio minimum)
5. **Rounded Corners** - 12-16px for cards, 8-12px for buttons
6. **Micro-interactions** - Subtle animations (spring physics, 200-300ms)
7. **Skeleton Screens** - Better than spinners for loading states
8. **Empty States with Illustrations** - Friendly, actionable empty states
9. **Dark Mode Support** - System-aware theming
10. **Spacing System** - 8pt grid (8, 16, 24, 32, 40px)

### Color Palette Best Practices
- **Primary color** - Brand color for CTAs (e.g., #FF6B6B)
- **Secondary color** - Supporting actions
- **Semantic colors** - Success (green), Warning (yellow), Error (red), Info (blue)
- **Neutral grays** - 5-7 shades (#f5f5f5, #e0e0e0, #999, #666, #333)
- **60-30-10 rule** - 60% neutral, 30% brand, 10% accent

### Typography Scale
```
Display:  32-40px (bold) - Hero sections
Heading:  20-28px (bold) - Section titles
Title:    18-20px (600)  - Card titles
Body:     14-16px (400)  - Main content
Caption:  12-14px (400)  - Meta info
Label:    10-12px (600)  - Form labels (uppercase)
```

---

## 🏗️ React Native Best Practices

### Component Architecture
1. **Custom Hooks for Logic** - Separate business logic from UI
2. **Reusable Components** - DRY principle, component library
3. **Prop Drilling Avoidance** - Context or Redux for deep state
4. **TypeScript Strict Mode** - Type safety everywhere
5. **Composition over Props** - Use children/render props for flexibility

### Performance Optimization
1. **FlatList/SectionList** - Always for scrollable lists (never ScrollView + map)
2. **useMemo/useCallback** - Memoize expensive calculations
3. **React.memo** - Prevent unnecessary re-renders
4. **Image Optimization** - Compressed images, lazy loading
5. **Code Splitting** - Lazy load screens with React.lazy()
6. **Debouncing** - Search inputs, filter changes (300ms)
7. **Virtualization** - Large lists with windowSize prop

### State Management
- **Redux Toolkit** - Global state (auth, user, app config)
- **useState** - Local component state
- **Custom Hooks** - Shared stateful logic
- **React Query/SWR** - Server state caching (consider for future)

---

## ♿ Accessibility (a11y)

### Touch Targets
- **Minimum 44x44pt** - iOS standard, Android 48x48dp
- **Spacing between targets** - 8px minimum
- **Hit slop** - Extend touch area for small icons

### Screen Readers
- **accessibilityLabel** - Descriptive labels for all interactive elements
- **accessibilityHint** - What happens when tapped
- **accessibilityRole** - button, link, header, etc.
- **accessibilityState** - disabled, selected, checked

### Visual Accessibility
- **Color contrast** - WCAG AA minimum (4.5:1 for text)
- **Don't rely on color alone** - Use icons + text
- **Focus indicators** - Visible focus for keyboard navigation
- **Text scaling support** - Support dynamic type sizes

---

## 🔄 Loading & Error States

### Loading States
1. **Skeleton Screens** - Better than spinners (shows content structure)
2. **Progressive Loading** - Load critical content first
3. **Optimistic Updates** - Show action immediately, rollback on error
4. **Pull-to-Refresh** - Standard pattern for feeds
5. **Infinite Scroll** - Load more with proper loading indicator

### Error States
1. **User-Friendly Messages** - No technical jargon
2. **Action Buttons** - "Try Again", "Go Back", "Contact Support"
3. **Contextual Errors** - Show errors inline (forms)
4. **Error Illustrations** - Friendly graphics for major errors
5. **Offline Detection** - Clear messaging when no connection

### Empty States
1. **Illustrations** - Friendly, on-brand graphics
2. **Clear Headline** - What's missing and why
3. **Primary Action** - How to populate this area
4. **Suggestions** - What user can do next

---

## 🔍 Search & Filtering Best Practices

### Search UX
1. **Debounced Search** - 300ms delay before API call
2. **Search Suggestions** - Quick access to popular searches
3. **Recent Searches** - Show user's search history
4. **Clear Button** - Easy way to reset search
5. **Search While Typing** - Instant results (if fast enough)
6. **No Results State** - Helpful suggestions, spell check

### Filters
1. **Chip-Based Filters** - Visual, easy to remove
2. **Filter Count Badge** - Show active filter count
3. **Quick Filters** - Most common filters always visible
4. **Advanced Filters** - Collapsible for power users
5. **Apply/Clear Buttons** - Batch filter changes
6. **Persistent Filters** - Remember user preferences

---

## 📝 Forms & Input Best Practices

### Input Fields
1. **Floating Labels** - Label moves up on focus
2. **Clear Icons** - X button to clear input
3. **Input Validation** - Real-time, helpful error messages
4. **Auto-Focus** - First field on screen load
5. **Keyboard Types** - email, phone, number, etc.
6. **Auto-Capitalize** - Appropriate for field type
7. **Password Toggle** - Show/hide password button

### Form Submission
1. **Disable Submit Until Valid** - Prevent errors
2. **Loading State on Button** - Show spinner while submitting
3. **Success Feedback** - Toast, checkmark, or navigation
4. **Error Handling** - Scroll to first error, highlight fields
5. **Auto-Save** - Save drafts automatically

---

## 🎨 Theme Constants & Circular Dependencies (Critical Lessons)

### Using STATIC_RADIUS for Early-Load Screens
**Problem**: Auth screens (LoginScreen, SignUpScreen) load BEFORE the JavaScript module system is fully ready. Importing `RADIUS` from `theme/index.ts` causes "[runtime not ready]: ReferenceError: Property 'RADIUS' doesn't exist"

**Root Cause**: Circular dependency chain during module initialization:
```
App.tsx → ThemeContext → paperTheme.ts → (attempts to import from theme/index.ts)
```

**Solution**: Created `theme/constants.ts` with static values safe to import at module load time:

```typescript
// ✅ CORRECT - Use STATIC_RADIUS for early-load screens
import { COLORS, TYPOGRAPHY, SPACING, SIZES } from '../../theme';
import { STATIC_RADIUS } from '../../theme/constants';

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: STATIC_RADIUS.md,  // Safe, no circular dependency
    padding: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: STATIC_RADIUS.md,
  },
  error: {
    backgroundColor: COLORS.error,
    borderRadius: STATIC_RADIUS.md,
    color: COLORS.white,
  },
});
```

```typescript
// ❌ WRONG - Don't use RADIUS in early-load screens
import { RADIUS } from '../../theme';

const styles = StyleSheet.create({
  input: {
    borderRadius: RADIUS.md,  // ❌ Error: "[runtime not ready]"
  },
});
```

### When to Use Each Theme Constant

| Constant | Source File | Use Case | Safety |
|----------|------------|----------|---------|
| `STATIC_RADIUS` | `theme/constants.ts` | Auth screens, early-load screens, StyleSheet.create() | ✅ Always safe |
| `RADIUS` | `theme/index.ts` | Authenticated screens, dynamic styles | ✅ Safe after login |
| `COLORS` | `theme/index.ts` or `tokens.ts` | All screens | ✅ Always safe |
| `SPACING` | `theme/index.ts` | All screens | ✅ Always safe |
| `TYPOGRAPHY` | `theme/tokens.ts` | All screens | ✅ Always safe |

### Circular Dependency Prevention Architecture

✅ **Current safe structure** (after fix):
```
App.tsx → ThemeContext → paperTheme.ts → tokens.ts ✓
                      ↘ constants.ts (standalone) ✓
theme/index.ts → tokens.ts + responsive.ts ✓ (no circles)
```

❌ **Previous broken structure** (before fix):
```
App.tsx → ThemeContext → paperTheme.ts → theme/index.ts ✗ (circular!)
                                      ↗ responsive.ts ↗
```

### Files Created to Prevent Circular Dependencies

1. **`theme/constants.ts`** (NEW)
   - Static values safe to import anywhere
   - No dependencies on other theme files
   - Perfect for early-load screens
   ```typescript
   export const STATIC_RADIUS = {
     none: 0,
     sm: 4,
     md: 8,      // Most common
     lg: 12,
     xl: 16,
     round: 9999,
   } as const;
   ```

2. **`theme/tokens.ts`** (Created earlier for dark mode)
   - Colors and typography separated from main theme
   - Imported by both ThemeContext and theme/index.ts
   - Breaks circular dependency

### Lesson Learned: Module Load Order Matters

**Key insight**: In React Native, screens loaded at app startup (LoginScreen, SignUpScreen) are initialized BEFORE the full module system is ready. Any circular dependencies or complex imports will fail with "[runtime not ready]" errors.

**Best practice**:
- Keep early-load screens simple
- Use standalone constants files
- Avoid complex theme imports in auth screens
- Test with `--clear` flag after theme changes

### Verification Commands

```bash
# Check for circular dependencies
npx madge --circular src/theme/

# Find hardcoded values that should use constants
grep -r "borderRadius: [0-9]" src/screens --include="*.tsx"

# Test with fresh Metro cache
npx expo start --clear
```

## ⚠️ Error & Warning Message Patterns (Critical Lessons)

### Error Message Styling - ALWAYS Follow This Pattern
**Problem**: Error messages with poor contrast are unreadable
**Solution**: Consistent error styling across all screens - WHITE text on SOLID color background

```typescript
error: {
  color: COLORS.white,                     // WHITE text for maximum contrast
  backgroundColor: COLORS.error,           // Solid red background (NOT errorLight)
  padding: SPACING.md,                     // Adequate padding
  borderRadius: RADIUS.md,                 // Rounded corners
  marginBottom: SPACING.md,                // Space below error
  textAlign: 'center',                     // Centered text
  fontSize: TYPOGRAPHY.fontSize.sm,        // Slightly smaller text
  fontWeight: TYPOGRAPHY.fontWeight.medium, // Medium weight for readability
}
```

### Warning Message Styling
**Problem**: Yellow text on yellow background is invisible
**Solution**: Use solid background with white text

```typescript
warning: {
  backgroundColor: COLORS.warning,         // Solid warning color (yellow/orange)
  padding: SPACING.md,
  borderRadius: RADIUS.md,
  color: COLORS.white,                     // WHITE text, NOT same color as bg
  fontSize: TYPOGRAPHY.fontSize.xs,
  fontWeight: TYPOGRAPHY.fontWeight.medium,
  textAlign: 'center',
}
```

### Button Text Cutoff Prevention
**Problem**: Button text appears cut off, especially on Android
**Solution**: Use minHeight instead of height, add proper padding

```typescript
button: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: SPACING.lg,          // Separate horizontal padding
  paddingVertical: SPACING.md,            // Separate vertical padding
  borderRadius: RADIUS.md,
  alignItems: 'center',
  marginTop: SPACING.sm,
  minHeight: SIZES.button.lg,             // minHeight instead of height
  justifyContent: 'center',               // Center content
},
buttonText: {
  ...TYPOGRAPHY.styles.button,
  color: COLORS.textInverse,
  lineHeight: Platform.OS === 'android' ? 24 : undefined, // Fix Android clipping
},
```

### API Interceptor Patterns - Token Refresh
**Problem**: 401 interceptor trying to refresh token on login endpoint causes infinite loading
**Solution**: Skip token refresh for auth endpoints

```typescript
// In ApiClient.ts response interceptor
async (error) => {
  const originalRequest = error.config;

  // Skip token refresh for auth endpoints (login, register, refresh)
  const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                         originalRequest.url?.includes('/auth/register') ||
                         originalRequest.url?.includes('/auth/refresh');

  // Handle 401 Unauthorized (but not for auth endpoints)
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    originalRequest._retry = true;
    // ... token refresh logic
  }

  return Promise.reject(error);
}
```

### Error Logging Best Practices
**Problem**: Console flooded with expected errors (like login failures, validation errors)
**Solution**: Only log unexpected errors to monitoring services - NOT user errors

```typescript
// In Login error handling
} catch (err: any) {
  // Extract user-friendly message
  let errorMessage = 'Login failed. Please try again.';
  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  }

  loginFailure(errorMessage);

  // Only log unexpected errors (not authentication or validation failures)
  // 401 = Unauthorized (wrong credentials) - Expected user error
  // 400 = Bad Request (validation errors) - Expected user error
  if (err.response?.status !== 401 && err.response?.status !== 400) {
    logError(err, { context: 'useLogin', emailOrPhone });
  }
}
```

```typescript
// In SignUp error handling
} catch (err: any) {
  let errorMessage = 'Failed to create account';
  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  }

  setError(errorMessage);

  // Only log unexpected errors (not validation or duplicate user errors)
  // 400 = Bad Request (validation errors) - Expected user error
  // 409 = Conflict (duplicate email/phone) - Expected user error
  if (err.response?.status !== 400 && err.response?.status !== 409) {
    logError(err, { context: 'useSignUp', email: formData.email });
  }
}
```

**IMPORTANT**: Never log expected user errors to Sentry/monitoring services:
- ❌ Don't log: Wrong passwords (401), validation errors (400), duplicate users (409)
- ✅ Do log: Server errors (500), network failures, unexpected crashes

### User-Friendly Error Messages
**Problem**: Technical error messages confuse users
**Solution**: Translate technical errors to user-friendly messages

❌ **DON'T**: "Invalid credentials"
✅ **DO**: "Your email or password is wrong, please check"

❌ **DON'T**: "Validation failed: password length"
✅ **DO**: "Password must be at least 8 characters"

❌ **DON'T**: "Network request failed"
✅ **DO**: "Unable to connect. Please check your internet connection"

### Consistent Styling Across Similar Screens
**Rule**: Auth screens (Login, SignUp, etc.) should have IDENTICAL styling

**Checklist for Consistency**:
- [ ] Error message styles match exactly
- [ ] Button styles match exactly
- [ ] Input field styles match exactly
- [ ] Loading states match exactly
- [ ] Platform-specific fixes applied to all (Android lineHeight, etc.)
- [ ] Spacing and padding consistent
- [ ] Color usage consistent

### Platform-Specific Input Handling
**Android-specific issues to watch for**:

1. **Text Cutoff**: Always add `lineHeight` for Android
2. **Input Height**: Android needs explicit height (e.g., 56) vs iOS uses minHeight
3. **Eye Button Position**: Android positioning differs from iOS

```typescript
input: {
  height: Platform.OS === 'android' ? 56 : SIZES.input.md,
  textAlignVertical: 'center',      // Android needs this
  includeFontPadding: false,        // Android needs this
},
eyeButton: {
  position: 'absolute',
  right: SPACING.md,
  top: Platform.OS === 'android' ? 16 : SPACING.md,  // Different positioning
  padding: SPACING.xs,
},
```

### Backend Error Response Format
**Always return consistent error structure from backend**:

```typescript
throw new UnauthorizedException('Your email or password is wrong, please check');
```

**Frontend should handle**:
```typescript
if (err.response?.data?.message) {
  errorMessage = err.response.data.message;  // NestJS standard format
} else if (err.response?.data?.error) {
  errorMessage = err.response.data.error;
} else if (err.message) {
  errorMessage = err.message;  // Network errors
}
```

### Testing Error States
**Always test these scenarios**:
1. Wrong credentials on login
2. Weak password on signup
3. Network timeout
4. Server error (500)
5. Invalid form data
6. Token expiration
7. Platform-specific rendering (iOS and Android)

### Color Contrast Requirements
**Minimum contrast ratios**:
- Normal text (14-16px): 4.5:1 ratio
- Large text (18px+): 3:1 ratio
- Interactive elements: 3:1 ratio

**Common mistakes**:
- ❌ Yellow text on yellow background
- ❌ Light gray text on white background
- ❌ Primary color text on primary light background
- ✅ Dark text on light background (7:1+ ratio)
- ✅ White text on dark background (7:1+ ratio)

---

## 🔔 Notifications & Messaging

### Push Notifications
1. **Permission Prompt** - Ask at the right moment (not on launch)
2. **Notification Preferences** - Granular controls
3. **Badge Counts** - Show unread count on app icon
4. **Deep Linking** - Open relevant screen from notification

### In-App Notifications
1. **Toast Messages** - 3-4 seconds, dismissible
2. **Snackbar** - Bottom notification with action button
3. **Alert Dialogs** - For critical actions (delete, logout)
4. **Notification Center** - In-app list of all notifications
5. **Read/Unread States** - Clear visual distinction

---

## 🎯 Onboarding Best Practices

### First Launch
1. **Progressive Disclosure** - Show features as needed
2. **Skip Button** - Allow users to skip intro
3. **3-5 Screens Max** - Don't overwhelm users
4. **Value-Focused** - Show benefits, not features
5. **Interactive Tutorial** - Learn by doing

### Empty States as Onboarding
- First-time users see educational empty states
- Show examples of what populated state looks like
- Primary action to get started

---

## 🚀 Performance Best Practices

### React Native Optimization
1. **Remove Console Logs** - Use __DEV__ checks
2. **Image Optimization** - WebP format, appropriate sizes
3. **Bundle Size** - Code splitting, tree shaking
4. **Memory Leaks** - Cleanup in useEffect return
5. **FlatList Optimization** - windowSize, maxToRenderPerBatch

### Network Optimization
1. **Request Batching** - Combine multiple API calls
2. **Caching** - Cache API responses, images
3. **Compression** - gzip/brotli compression
4. **CDN** - Serve static assets from CDN
5. **Pagination** - Load data in chunks

---

## 🎭 Animation & Micro-interactions

### Animation Principles
1. **Subtle & Purposeful** - Enhance UX, don't distract
2. **Consistent Timing** - 200-300ms for most interactions
3. **Spring Physics** - Natural motion (React Native Animated)
4. **Easing Functions** - easeInOut for most cases
5. **Respect Reduced Motion** - Honor system preferences

### Common Micro-interactions
1. **Button Press** - Scale down slightly (0.95)
2. **Card Tap** - Slight scale or shadow increase
3. **Pull to Refresh** - Spinner with bounce
4. **Swipe Actions** - Reveal actions on swipe
5. **Toggle Switches** - Smooth thumb slide
6. **Success Checkmark** - Animated checkmark on completion

---

## 📊 Analytics & Tracking

### Event Tracking
1. **Screen Views** - Every screen navigation
2. **User Actions** - Taps, searches, filters
3. **Conversions** - Deal redeemed, business followed
4. **Errors** - Track errors with context
5. **Performance** - App launch time, screen load time

### User Properties
- User type (consumer/business)
- Signup date
- Location
- Preferences
- App version

---

## 🎨 Component Library Standards

### Button Variants
```
Primary:   Solid background, white text
Secondary: Outlined, colored border
Tertiary:  Ghost, no border
Danger:    Red background, for destructive actions
```

### Card Patterns
```
Basic Card:     White bg, subtle shadow, 12px radius
Elevated Card:  Higher shadow, interactive
Outlined Card:  Border only, no shadow
Image Card:     Image + overlay text
```

### Deal Card Consistency Pattern
**Rule**: Cards should have consistent design across the app with conditional sections based on context

**Implementation Pattern**:
- **ShopDealCard** (Business Profile) = Base card WITHOUT business name
- **FeedDealCard** (Feed/Search/Near You) = Same card WITH business name added

**Key Styling Requirements**:
```typescript
// Both cards MUST share these exact styles:
card: {
  backgroundColor: COLORS.white,
  borderRadius: 0,               // No border radius for grid layouts
  width: '100%',                 // Fill wrapper width (not fixed 180px)
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 30,
  elevation: 5,
},
imageContainer: {
  width: '100%',
  aspectRatio: 1,               // Square images (not fixed height/width)
  backgroundColor: '#f8f9fa',
},
productInfo: {
  padding: 8,                    // Compact padding
},
productTitle: {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 18,
  marginBottom: 2,               // Tight spacing
},
priceSection: {
  marginBottom: 5,               // Consistent spacing
},
```

**Only Difference Between Card Types**:
```typescript
// FeedDealCard ONLY adds this section between title and price:
{deal.business && (
  <TouchableOpacity
    style={styles.shopNameContainer}
    onPress={handleBusinessPress}
  >
    <Text style={styles.shopName} numberOfLines={1}>
      {deal.business.business_name}
    </Text>
  </TouchableOpacity>
)}
```

**Layout Usage** (2-column grid):
```typescript
// FlatList/FlashList with numColumns={2}
<FlatList
  data={deals}
  numColumns={2}
  renderItem={({ item, index }) => (
    <View style={[
      styles.cardWrapper,
      index % 2 === 0 ? styles.leftCard : styles.rightCard
    ]}>
      <FeedDealCard deal={item} onPress={() => handleDealPress(item)} />
    </View>
  )}
/>

// Wrapper styles for proper grid spacing
cardWrapper: {
  marginBottom: SPACING.md,
},
leftCard: {
  marginRight: SPACING.xs,
  marginLeft: -SPACING.xs,
},
rightCard: {
  marginLeft: SPACING.xs,
  marginRight: -SPACING.xs,
},
```

**Why This Pattern**:
- ✅ Consistent visual design across all screens
- ✅ No duplicate code - one card component per context
- ✅ Responsive width fills column space properly
- ✅ Conditional sections based on context (business name only where needed)
- ✅ Easy to maintain - changes to base styling update both card types

### Modal Types
```
Bottom Sheet:   Slides up from bottom (preferred mobile)
Center Modal:   Centered overlay
Full Screen:    Takes full screen (complex forms)
Action Sheet:   List of actions (iOS style)
```

---

## 🔐 Security Best Practices

1. **Secure Storage** - Never store tokens in AsyncStorage, use secure storage
2. **API Keys** - Environment variables, never commit
3. **HTTPS Only** - All API calls over HTTPS
4. **Input Sanitization** - Validate and sanitize all inputs
5. **Token Refresh** - Auto-refresh expired tokens
6. **Biometric Auth** - Face ID / Touch ID for sensitive actions

---

## 📱 Platform-Specific Guidelines

### iOS Human Interface Guidelines
- **SF Symbols** - Use system icons
- **Navigation Bar** - Large titles for top-level screens
- **Haptic Feedback** - Use UIImpactFeedbackGenerator
- **Modal Presentation** - Card style for modals
- **System Fonts** - SF Pro for consistency

### Android Material Design
- **Material Icons** - Use Material Design icons
- **Floating Action Button** - Primary action (if applicable)
- **Ripple Effect** - Touch feedback on all interactive elements
- **Snackbar** - Preferred notification method
- **Roboto Font** - System default

---

## 🧪 Testing Best Practices

1. **Unit Tests** - Test hooks and utility functions
2. **Component Tests** - React Testing Library
3. **E2E Tests** - Detox for critical flows
4. **Visual Regression** - Screenshot testing
5. **Accessibility Testing** - Axe or similar tools

---

## 📝 Code Style & Documentation

### Code Comments
- **Why, not what** - Explain reasoning, not obvious code
- **TODOs** - Tag with context: `// TODO: Add pagination when API ready`
- **Complex Logic** - Document algorithms, formulas
- **API Documentation** - JSDoc for public functions

### File Organization
```
src/
├── components/       # Reusable UI components
│   ├── buttons/
│   ├── cards/
│   └── inputs/
├── screens/         # Full screen components
├── hooks/           # Custom React hooks
├── services/        # API, analytics, etc.
├── store/           # Redux slices
├── types/           # TypeScript types
├── utils/           # Helper functions
├── config/          # App configuration
└── navigation/      # Navigation setup
```

---

## 🎯 Feature Development Checklist

When implementing a new feature, ensure:

- [ ] **TypeScript types defined** for all data structures
- [ ] **Custom hook created** for business logic (if applicable)
- [ ] **Reusable components** extracted where possible
- [ ] **Loading states** implemented
- [ ] **Error states** implemented with retry logic
- [ ] **Empty states** with helpful messaging
- [ ] **Analytics tracking** added
- [ ] **Accessibility labels** added
- [ ] **Error logging** to Sentry
- [ ] **Dark mode support** (if applicable)
- [ ] **Pull-to-refresh** (for list screens)
- [ ] **Keyboard handling** (for forms)
- [ ] **Navigation integrated** properly
- [ ] **No console warnings** in development
- [ ] **TypeScript compilation** passes

---

## 💡 Proactive Suggestions Framework

When the user asks for a feature, **always suggest**:

1. **Better UX alternatives** - "A bottom sheet would work better than a modal here"
2. **Standard patterns** - "Most apps use infinite scroll for this"
3. **Performance optimizations** - "Let's use FlatList instead of ScrollView"
4. **Accessibility improvements** - "We should add labels for screen readers"
5. **Error prevention** - "Let's add validation before submission"
6. **Future-proofing** - "Let's make this component reusable"
7. **Analytics** - "We should track when users do X"
8. **Edge cases** - "What happens when there's no data?"

---

## 📚 Resources & References

### Design Systems
- [Material Design](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Ant Design Mobile](https://mobile.ant.design/)

### UI/UX Inspiration
- [Dribbble](https://dribbble.com/tags/mobile-app)
- [Mobbin](https://mobbin.com/) - Mobile app screenshots
- [UI Sources](https://www.uisources.com/)
- [Pttrns](https://pttrns.com/)

### React Native Resources
- [React Native Directory](https://reactnative.directory/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Best Practices](https://github.com/rantiev/react-native-best-practices)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-15 | Initial creation - Comprehensive best practices guide |
| 1.1.0 | 2025-10-18 | Added critical section: Error & Warning Message Patterns - Lessons from production issues including API interceptor patterns, button text cutoff fixes, color contrast requirements, and platform-specific Android handling |
| 1.2.0 | 2025-10-18 | Added Deal Card Consistency Pattern - Documented approach for maintaining consistent card designs across different contexts (FeedDealCard vs ShopDealCard) with responsive layouts and conditional sections |

---

**Remember**: These are guidelines, not strict rules. Always consider the specific context and user needs. When in doubt, prioritize **user experience** and **accessibility** over aesthetic trends.
